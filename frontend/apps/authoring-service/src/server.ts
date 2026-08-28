import {serve} from '@hono/node-server';
import {Hono, type Context, type Next} from 'hono';
import {cors} from 'hono/cors';
import {streamSSE} from 'hono/streaming';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import type {Server as HttpServer} from 'node:http';
import path from 'node:path';
import {z} from 'zod';

import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';

import {EchoAgentRunner, type AgentRunner} from './agent/AgentRunner.js';
import {ClaudeAgentRunner} from './agent/ClaudeAgentRunner.js';
import {ClaudeTutorRunner} from './agent/ClaudeTutorRunner.js';
import {
  EchoTutorRunner,
  type TutorEvent,
  type TutorRunner,
} from './agent/TutorRunner.js';
import {loadAuthoringBridge} from './authoring/bridge.js';
import {CurriculumChangeBodySchema} from './authoring/changeSchema.js';
import type {CurriculumChange, ResolveLevel} from './authoring/model.js';
import {importCourseIfMissing} from './boot/importCourse.js';
import {LevelCatalog, repairLevelProperties} from './boot/levelCatalog.js';
import {FRONTEND_ROOT, resolveRepoRoot} from './boot/paths.js';
import {createMazeLevel} from './levels/createMazeLevel.js';
import {checkImportedMazeLevel} from './levels/importedLevelCheck.js';
import {
  buildBlankMazeLevelDefinition,
  CREATABLE_MAZE_SKINS,
} from './levels/mazeLevel.js';
import {buildChangeSet} from './publish/buildChangeSet.js';
import {AuthoringState} from './state/AuthoringState.js';
import {
  EMPTY_SNAPSHOT,
  SessionStore,
  type ChatScope,
} from './store/SessionStore.js';
import {rebuildWidgetSource} from './widgets/buildWidget.js';
import {applyWritebackPlan, computePlanHash} from './writeback/apply.js';
import {buildWritebackPlan, type WritebackPlan} from './writeback/plan.js';

const PORT = Number(process.env.PORT) || 3737;
const SESSION_ID = 'default';
const STUDIO_ORIGIN = process.env.STUDIO_ORIGIN || 'http://localhost:3036';
const HEARTBEAT_MS = 25_000;

const bridge = await loadAuthoringBridge();
const store = SessionStore.forSession(FRONTEND_ROOT, SESSION_ID);

let repoRoot: string | undefined;
try {
  repoRoot = resolveRepoRoot();
} catch (error) {
  console.error(String(error));
}

const catalog = repoRoot
  ? LevelCatalog.scan(repoRoot, bridge.parseLevelXml)
  : LevelCatalog.scan('/nonexistent');

// Mutually recursive by design: the catalog registers resolved levels back into
// the state that asked for them. Both annotations are needed to break the cycle
// for inference; the closure only runs after construction.
const resolveLevel: ResolveLevel = levelKey =>
  catalog.resolveLevel(levelKey, state);

const state: AuthoringState = new AuthoringState({
  store,
  applyChange: bridge.applyChange,
  snapshot: store.readSnapshot() ?? {...EMPTY_SNAPSHOT},
  changes: store.readChanges(),
  resolveLevel,
});

// AUTHORING_IMPORT_COURSES: comma-separated course names to seed the session
// with (default: the single course importCourseIfMissing ships with).
const importCourseNames = (process.env.AUTHORING_IMPORT_COURSES ?? '')
  .split(',')
  .map(name => name.trim())
  .filter(Boolean);
if (repoRoot) {
  for (const courseName of importCourseNames.length
    ? importCourseNames
    : [undefined]) {
    try {
      await importCourseIfMissing(state, bridge, repoRoot, courseName);
    } catch (error) {
      console.error(
        `[authoring-service] course import failed: ${String(error)}`,
      );
    }
  }
}

// One-time repair for LevelProperties a previous run of the buggy lazy
// catalog path persisted without `appName` — see repairLevelProperties.
const levelPropertiesFix = repairLevelProperties(
  state.getSnapshot().levelProperties,
);
if (Object.keys(levelPropertiesFix).length > 0) {
  state.registerLevelProperties(levelPropertiesFix);
}

// Single construction point for the runners. AUTHORING_AGENT=echo keeps the
// placeholder (useful for tests and offline demos of the deterministic path).
const useEcho = process.env.AUTHORING_AGENT === 'echo';
const agentRunner: AgentRunner = useEcho
  ? new EchoAgentRunner()
  : new ClaudeAgentRunner({store, catalog});
const tutorRunner: TutorRunner = useEcho
  ? new EchoTutorRunner()
  : new ClaudeTutorRunner();

// The agent edits widget source as normal files (Write/Edit); watch the tree
// so those edits become live-reload events without a dedicated tool call. A
// built widget's src/ edits go through rebuildAndNotify (esbuild, then
// notify only on success); a legacy widget's direct widget.html edit still
// just notifies.
watchWidgetSources(
  store.widgetsDir,
  widgetId => state.notifyWidgetSourceChanged(widgetId),
  widgetId => void rebuildAndNotify(widgetId),
);

async function rebuildAndNotify(widgetId: string): Promise<void> {
  const title = state.findWidget(widgetId)?.title ?? widgetId;
  const result = await rebuildWidgetSource(store, widgetId, title);
  if (!result) {
    return; // no src/ — not a built widget, nothing to do
  }
  if (result.ok) {
    state.notifyWidgetSourceChanged(widgetId);
  } else {
    console.error(
      `[authoring-service] widget ${widgetId} build failed:\n${result.errorText}`,
    );
  }
}

const app = new Hono();

app.use('/api/*', cors({origin: STUDIO_ORIGIN, credentials: false}));

// Loopback bind (see serve() below) keeps this off the network; this header
// check is the agreed CSRF mitigation on top of that for a page that isn't
// Studio driving a mutation against localhost. Sec-Fetch-Site is sent by all
// current browsers; its absence (older browsers, non-browser clients) is not
// treated as suspicious — only an explicit 'cross-site' is rejected.
app.use('/api/chat', rejectCrossSite);
app.use('/api/changes', rejectCrossSite);
app.use('/api/tutor', rejectCrossSite);
app.use('/api/publish', rejectCrossSite);
app.use('/api/levels/:numericId/check', rejectCrossSite);
app.use('/api/levels/create-maze', rejectCrossSite);
app.use('/api/writeback/apply', rejectCrossSite);

app.get('/api/state', c =>
  c.json({
    version: state.version,
    courses: state.getSnapshot().courses,
    widgets: state.getSnapshot().widgets,
    changes: state.getChanges(),
    lastPublish: store.getLatestPublishInfo(),
  }),
);

app.get('/api/levels/:numericId/level_properties', c => {
  const numericId = c.req.param('numericId');
  const properties = state.getLevelProperties(numericId);
  if (!properties) {
    return c.json({error: `unknown level id ${numericId}`}, 404);
  }
  return c.json({[numericId]: properties});
});

// Author-mode "Check level" affordance on maze-family existingLevel
// experiences: an authoring-time lint, not a play-time gate. Reuses the same
// levelProperties the lab itself mounts from, so the check sees exactly what
// the learner would.
app.post('/api/levels/:numericId/check', c => {
  const numericId = c.req.param('numericId');
  const properties = state.getLevelProperties(numericId);
  if (!properties) {
    return c.json({error: `unknown level id ${numericId}`}, 404);
  }
  return c.json(checkImportedMazeLevel({properties}));
});

app.get('/api/levels/search', c => {
  const query = c.req.query('q') ?? '';
  return c.json({levels: catalog.searchLevels(query)});
});

const CreateMazeLevelBodySchema = z.object({
  lessonId: z.string().min(1),
  position: z.number().int(),
  title: z.string().min(1).optional(),
  skin: z.enum(CREATABLE_MAZE_SKINS).optional(),
  rows: z.number().int().optional(),
  cols: z.number().int().optional(),
});

// The manual "New maze level" authoring affordance (gap #5 of the parity
// challenge): a blank, trivially-solvable template — same orchestration as
// the agent's create_level tool (createMazeLevel), just with an
// author-picked skin/grid-size instead of AI-authored content. See
// buildBlankMazeLevelDefinition's doc comment for why the template must
// pass verifyMazeLevelSolvable honestly rather than being waved through.
app.post('/api/levels/create-maze', async c => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({error: 'malformed JSON body'}, 400);
  }
  const parsed = CreateMazeLevelBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({error: parsed.error.message}, 400);
  }
  const {lessonId, position, title, skin, rows, cols} = parsed.data;
  const definition = buildBlankMazeLevelDefinition({skin, rows, cols});
  const result = createMazeLevel(state, store, {
    lessonId,
    position,
    title: title ?? 'New maze level',
    definition,
    actor: 'author',
  });
  if (!result.ok) {
    return c.json({error: result.reason}, 400);
  }
  return c.json({version: state.version, ...result});
});

app.get('/api/widgets/:id', c => {
  const id = c.req.param('id');
  const descriptor = state.findWidget(id);
  // An id that fails SessionStore's format check (e.g. a path-traversal
  // attempt) throws rather than resolving outside widgetsDir; treat it the
  // same as "not found" instead of surfacing a 500.
  let html: string | undefined;
  try {
    html = state.readWidgetSource(id);
  } catch {
    html = undefined;
  }
  if (!descriptor && html === undefined) {
    return c.json({error: `unknown widget ${id}`}, 404);
  }
  // Agent-authored documents get the sandbox chrome (CSP + McpApp shim)
  // guaranteed at the serve boundary, whatever the agent wrote.
  return c.json({
    descriptor,
    html: html ? injectWidgetChrome(html) : html,
  });
});

app.get('/api/events', c =>
  streamSSE(c, async stream => {
    // Registered before any await: an immediate client disconnect (during
    // the first writeSSE below) must still reach this listener, or the
    // subscriber and heartbeat set up afterward would leak forever — the
    // abort event only ever fires once, at the moment the client goes away.
    // A holder object, not two `let`s: onAbort's callback closes over it
    // before either resource exists.
    const resources: {
      unsubscribe?: () => void;
      heartbeat?: ReturnType<typeof setInterval>;
    } = {};
    const aborted = new Promise<void>(resolve => {
      stream.onAbort(() => {
        resources.unsubscribe?.();
        if (resources.heartbeat !== undefined) {
          clearInterval(resources.heartbeat);
        }
        resolve();
      });
    });

    await stream.writeSSE({
      data: JSON.stringify({type: 'hello', version: state.version}),
    });
    if (stream.aborted) {
      // onAbort already ran and cleaned up (nothing was created yet); do
      // not create a subscriber/heartbeat that will never be cleaned up.
      return;
    }

    resources.unsubscribe = state.subscribe(event => {
      void stream.writeSSE({data: JSON.stringify(event)});
    });
    resources.heartbeat = setInterval(() => {
      void stream.write(': ping\n\n');
    }, HEARTBEAT_MS);

    await aborted;
  }),
);

app.post('/api/chat', async c => {
  const body = (await c.req.json()) as {scope?: ChatScope; message?: string};
  const message = body.message?.trim();
  if (!message) {
    return c.json({error: 'message is required'}, 400);
  }
  const scope = body.scope ?? {};
  state.appendChatMessage('author', message, scope);

  const turnId = randomUUID();
  void agentRunner
    .runTurn({turnId, sessionId: SESSION_ID, scope, message, state})
    .catch((error: unknown) => {
      const detail = String(error);
      state.emit({type: 'agent-status', turnId, status: 'error', detail});
      state.appendChatMessage('status', `Agent turn failed: ${detail}`, scope);
    });

  return c.json({turnId});
});

app.get('/api/chat/log', c => c.json({messages: state.getChatLog()}));

app.post('/api/changes', async c => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({error: 'malformed JSON body'}, 400);
  }
  const parsed = CurriculumChangeBodySchema.safeParse(
    (body as {change?: unknown} | undefined)?.change,
  );
  if (!parsed.success) {
    return c.json({error: parsed.error.message}, 400);
  }
  let change: CurriculumChange;
  try {
    change = state.applyCurriculumChange(parsed.data, 'author');
  } catch (error) {
    return c.json({error: errorMessage(error)}, 400);
  }
  // The applied change (not just the body the caller sent) carries whatever
  // the server itself filled in — seq/at/actor, and for override* ops the
  // captured `previous` — which is what a client-side Undo/Redo needs to
  // build an exact compensating change without re-deriving it (see
  // studio's useUndoRedo.ts).
  return c.json({version: state.version, change});
});

app.post('/api/tutor', async c => {
  const body = (await c.req.json()) as {
    lessonId?: string;
    transcript?: TutorEvent[];
  };
  if (!body.lessonId) {
    return c.json({error: 'lessonId is required'}, 400);
  }
  const action = await tutorRunner.runTurn({
    lessonId: body.lessonId,
    transcript: body.transcript ?? [],
    state,
  });
  return c.json(action);
});

// Shared by both writeback endpoints so plan and apply build the identical
// input buildWritebackPlan/applyWritebackPlan compute over — see
// writeback/plan.ts's doc comment on why planning and applying must share
// one computation.
function writebackPlanInput() {
  if (!bridge.parseLevelXml || !bridge.patchLevelFile || !repoRoot) {
    return undefined;
  }
  return {
    courses: state.getSnapshot().courses,
    changes: state.getChanges(),
    resolveLevelFilePath: (levelKey: string) => catalog.filePath(levelKey),
    readFile: (filePath: string) => fs.readFileSync(filePath, 'utf8'),
    parseLevelXml: bridge.parseLevelXml,
    patchLevelFile: bridge.patchLevelFile,
    repoRoot,
  };
}

/** The plan's public shape: the full patched `after` text never leaves the
 * process — a diff is what the write-back dialog renders, and there is no
 * reason to ship the whole file twice over the wire. */
function publicPlan(plan: WritebackPlan) {
  return {
    planHash: computePlanHash(plan),
    edits: plan.edits.map(edit => ({
      path: edit.path,
      levelKey: edit.levelKey,
      unifiedDiff: edit.unifiedDiff,
      beforeHash: edit.beforeHash,
      afterHash: edit.afterHash,
    })),
    skipped: plan.skipped,
  };
}

// Dry-run only — see writeback/plan.ts's doc comment. Requires
// @code-dot-org/authoring's dist (parseLevelXml/patchLevelFile) and a
// resolved repoRoot; both are also required for the level catalog and
// course import, so their absence already means a degraded service.
app.get('/api/writeback/plan', c => {
  const input = writebackPlanInput();
  if (!input) {
    return c.json({error: '@code-dot-org/authoring writeback is not available'}, 503);
  }
  return c.json(publicPlan(buildWritebackPlan(input)));
});

const WritebackApplyBodySchema = z.object({planHash: z.string().optional()});

// Recomputes the plan from scratch (never trusts a client-cached one), then
// writes each edit whose beforeHash still matches what's on disk right now.
// Never git add/commit/push — the user reviews dashboard/config themselves.
app.post('/api/writeback/apply', async c => {
  const input = writebackPlanInput();
  if (!input) {
    return c.json({error: '@code-dot-org/authoring writeback is not available'}, 503);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }
  const parsed = WritebackApplyBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({error: parsed.error.message}, 400);
  }

  const outcome = applyWritebackPlan(input, parsed.data.planHash);
  if (!outcome.ok) {
    return c.json(
      {
        error: 'plan-changed',
        message:
          'the write-back plan changed since it was last computed — review the refreshed plan before applying it',
        ...publicPlan(outcome.plan),
      },
      409,
    );
  }
  return c.json({planHash: outcome.planHash, ...outcome.result});
});

app.post('/api/publish', c => {
  const changeSet = buildChangeSet({
    snapshot: state.getSnapshot(),
    changes: state.getChanges(),
    readWidgetSource: widgetId => state.readWidgetSource(widgetId),
  });
  const file = store.writePublishArtifact(changeSet);
  console.log(`[authoring-service] wrote ${file}`);
  return c.json(changeSet);
});

async function rejectCrossSite(c: Context, next: Next) {
  if (c.req.header('Sec-Fetch-Site') === 'cross-site') {
    return c.json({error: 'cross-site request rejected'}, 403);
  }
  await next();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Watch each widget's source for edits, debounced per widget (editors and
 * the agent's Write both produce bursts of fs events for one save), and
 * dispatch by kind: a legacy widget's `widget.html` (direct edit — just
 * notify) versus a built widget's `src/**` (esbuild rebuild first, notify
 * only if it lands — see rebuildAndNotify above).
 */
function watchWidgetSources(
  widgetsDir: string,
  onLegacyChange: (widgetId: string) => void,
  onSourceChange: (widgetId: string) => void,
): void {
  const pending = new Map<string, NodeJS.Timeout>();
  try {
    fs.watch(widgetsDir, {recursive: true}, (_event, filename) => {
      if (!filename) {
        return;
      }
      const parts = filename.split(path.sep);
      const widgetId = parts[0];
      if (!widgetId || widgetId === '.') {
        return;
      }
      const rest = parts.slice(1);
      const isLegacyEdit = rest.length === 1 && rest[0] === 'widget.html';
      const isSourceEdit = rest.length > 1 && rest[0] === 'src';
      if (!isLegacyEdit && !isSourceEdit) {
        return;
      }
      // Keyed by kind too: a rebuild-in-flight for src/ must not be
      // cancelled by an unrelated widget.html write (build output) landing
      // moments later on the same widget.
      const debounceKey = `${widgetId}:${isSourceEdit ? 'src' : 'html'}`;
      clearTimeout(pending.get(debounceKey));
      pending.set(
        debounceKey,
        setTimeout(() => {
          pending.delete(debounceKey);
          (isSourceEdit ? onSourceChange : onLegacyChange)(widgetId);
        }, 150),
      );
    });
  } catch (error) {
    console.error(
      `[authoring-service] widget source watch unavailable: ${String(error)}`,
    );
  }
}

const httpServer = serve(
  {fetch: app.fetch, port: PORT, hostname: '127.0.0.1'},
  info => {
    console.log(
      `[authoring-service] session ${SESSION_ID} at ${store.root}\n` +
        `[authoring-service] ${catalog.size} attachable level(s) indexed\n` +
        `[authoring-service] listening on http://localhost:${info.port}`,
    );
  },
);

// Gap #10 of the parity challenge: "Add existing level" search intermittently
// got net::ERR_FAILED across every /authoring-api/* route until a page
// reload. Node's http.Server defaults keepAliveTimeout to 5s (headersTimeout
// to 6s) — well inside how long Vite's dev proxy agent (apps/studio/vite.
// config.ts) can hold an idle keep-alive socket open before reusing it for
// the next request. When the server closes that socket first, the proxy's
// next reuse attempt races it and the browser sees an opaque ERR_FAILED,
// indistinguishable from every other request on the same connection pool —
// which is why it looked like ALL routes had gone down at once rather than
// one request failing. Raising both well above any realistic idle window is
// the standard mitigation (Node's own docs recommend keepAliveTimeout above
// whatever's in front of it); headersTimeout must stay above
// keepAliveTimeout or Node's own assertion trips.
// serve()'s return type is a union with the http2 server classes (for
// callers that pass http2 serverOptions); this call passes none, so it's
// always the plain node:http Server these two properties live on.
(httpServer as HttpServer).keepAliveTimeout = 65_000;
(httpServer as HttpServer).headersTimeout = 66_000;
