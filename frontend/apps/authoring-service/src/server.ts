import {serve} from '@hono/node-server';
import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {streamSSE} from 'hono/streaming';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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
import {
  CURRICULUM_CHANGE_OPS,
  type CurriculumChangeBody,
  type ResolveLevel,
} from './authoring/model.js';
import {importCourseIfMissing} from './boot/importCourse.js';
import {LevelCatalog, repairLevelProperties} from './boot/levelCatalog.js';
import {FRONTEND_ROOT, resolveRepoRoot} from './boot/paths.js';
import {buildChangeSet} from './publish/buildChangeSet.js';
import {AuthoringState} from './state/AuthoringState.js';
import {
  EMPTY_SNAPSHOT,
  SessionStore,
  type ChatScope,
} from './store/SessionStore.js';

const PORT = 3737;
const SESSION_ID = 'default';
const STUDIO_ORIGIN = 'http://localhost:3036';
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

if (repoRoot) {
  try {
    await importCourseIfMissing(state, bridge, repoRoot);
  } catch (error) {
    console.error(`[authoring-service] course import failed: ${String(error)}`);
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
// so those edits become live-reload events without a dedicated tool call.
watchWidgetSources(store.widgetsDir, widgetId =>
  state.notifyWidgetSourceChanged(widgetId),
);

const app = new Hono();

app.use('/api/*', cors({origin: STUDIO_ORIGIN, credentials: false}));

app.get('/api/state', c =>
  c.json({
    version: state.version,
    courses: state.getSnapshot().courses,
    widgets: state.getSnapshot().widgets,
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

app.get('/api/levels/search', c => {
  const query = c.req.query('q') ?? '';
  return c.json({levels: catalog.searchLevels(query)});
});

app.get('/api/widgets/:id', c => {
  const id = c.req.param('id');
  const descriptor = state.findWidget(id);
  const html = state.readWidgetSource(id);
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
    await stream.writeSSE({
      data: JSON.stringify({type: 'hello', version: state.version}),
    });

    const unsubscribe = state.subscribe(event => {
      void stream.writeSSE({data: JSON.stringify(event)});
    });
    const heartbeat = setInterval(() => {
      void stream.write(': ping\n\n');
    }, HEARTBEAT_MS);

    await new Promise<void>(resolve => {
      stream.onAbort(() => {
        unsubscribe();
        clearInterval(heartbeat);
        resolve();
      });
    });
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
  const body = (await c.req.json()) as {change?: CurriculumChangeBody};
  const change = body.change;
  if (!change || !isKnownOp(change.op)) {
    return c.json({error: `unknown change op ${String(change?.op)}`}, 400);
  }
  try {
    state.applyCurriculumChange(change, 'author');
  } catch (error) {
    return c.json({error: errorMessage(error)}, 400);
  }
  return c.json({version: state.version});
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

function isKnownOp(op: unknown): op is CurriculumChangeBody['op'] {
  return CURRICULUM_CHANGE_OPS.includes(op as CurriculumChangeBody['op']);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Watch `widgets/<id>/widget.html` for edits, debounced per widget: editors
 * and the agent's Write both produce bursts of fs events for one save.
 */
function watchWidgetSources(
  widgetsDir: string,
  onChange: (widgetId: string) => void,
): void {
  const pending = new Map<string, NodeJS.Timeout>();
  try {
    fs.watch(widgetsDir, {recursive: true}, (_event, filename) => {
      if (!filename || path.basename(filename) !== 'widget.html') {
        return;
      }
      const widgetId = path.dirname(filename);
      if (widgetId === '.' || widgetId.includes(path.sep)) {
        return;
      }
      clearTimeout(pending.get(widgetId));
      pending.set(
        widgetId,
        setTimeout(() => {
          pending.delete(widgetId);
          onChange(widgetId);
        }, 150),
      );
    });
  } catch (error) {
    console.error(
      `[authoring-service] widget source watch unavailable: ${String(error)}`,
    );
  }
}

serve({fetch: app.fetch, port: PORT}, info => {
  console.log(
    `[authoring-service] session ${SESSION_ID} at ${store.root}\n` +
      `[authoring-service] ${catalog.size} attachable level(s) indexed\n` +
      `[authoring-service] listening on http://localhost:${info.port}`,
  );
});
