import {
  createSdkMcpServer,
  query,
  tool,
  type HookInput,
  type SDKMessage,
  type SyncHookJSONOutput,
} from '@anthropic-ai/claude-agent-sdk';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {z} from 'zod';

import type {
  Experience,
  ExistingLevelExperience,
  Lesson,
  WidgetDescriptor,
} from '../authoring/model.js';
import type {LevelCatalog} from '../boot/levelCatalog.js';
import {createMazeLevel} from '../levels/createMazeLevel.js';
import {checkImportedMazeLevel} from '../levels/importedLevelCheck.js';
import {buildLevelView, isMazeFamilyLevel} from '../levels/levelView.js';
import {
  buildMazeLevelWireProperties,
  MazeLevelDefinitionPatchSchema,
  MazeLevelDefinitionSchema,
  verifyDebugMazeLevel,
  verifyMazeLevelSolvable,
} from '../levels/mazeLevel.js';
import type {AuthoringState} from '../state/AuthoringState.js';
import type {SessionStore} from '../store/SessionStore.js';
import {rebuildWidgetSource} from '../widgets/buildWidget.js';

import type {AgentRunner, AgentTurnInput} from './AgentRunner.js';
import {oneLineCheckVerdict} from './checkNarration.js';
import {AUTHORING_SYSTEM_PROMPT, describeScope} from './systemPrompt.js';

const MODEL = 'sonnet';
const MAX_TURNS = 40;

// create_widget seeds this so the freshly created src/ builds even before
// the agent's own Write lands (the watcher, and this turn's own
// handleWidgetBuildHook, can both run a build against it first).
const SEED_WIDGET_TSX = `import {createRoot} from 'react-dom/client';

function App() {
  return <div>New widget — replace this with the real component.</div>;
}

createRoot(document.getElementById('root')!).render(<App />);
`;

interface ClaudeAgentRunnerOptions {
  store: SessionStore;
  catalog: LevelCatalog;
}

/**
 * The embedded authoring agent: Claude (via the Agent SDK, which drives the
 * local Claude Code runtime and its existing login) with curriculum mutations
 * exposed as an in-process MCP server and file access confined to the session
 * workspace. Model calls happen here in Node — the browser never needs a key.
 */
export class ClaudeAgentRunner implements AgentRunner {
  private readonly store: SessionStore;
  private readonly catalog: LevelCatalog;

  constructor(options: ClaudeAgentRunnerOptions) {
    this.store = options.store;
    this.catalog = options.catalog;
  }

  async runTurn(input: AgentTurnInput): Promise<void> {
    const {state, turnId, scope, message} = input;
    state.emit({type: 'agent-status', turnId, status: 'started'});

    const {server: curriculum, toolNames} = buildCurriculumServer(
      state,
      this.store,
      this.catalog,
    );
    const prompt = `${describeScope(enrichScope(scope, state, this.store))}${message}`;

    const stream = query({
      prompt,
      options: {
        model: MODEL,
        cwd: this.store.root,
        systemPrompt: AUTHORING_SYSTEM_PROMPT,
        mcpServers: {curriculum},
        // The semantic ops are pre-approved; everything else funnels through
        // canUseTool, which confines file tools to the session workspace.
        // Derived from the actual tool array (not a hand-maintained parallel
        // list) so a name can never silently drift out of sync — see
        // buildCurriculumServer's return.
        allowedTools: toolNames.map(name => `mcp__curriculum__${name}`),
        disallowedTools: [
          'Bash',
          'WebFetch',
          'WebSearch',
          'Task',
          'NotebookEdit',
          'KillShell',
        ],
        canUseTool: async (toolName, toolInput) =>
          guardFileTool(toolName, toolInput, this.store),
        // A Write/Edit under widgets/<id>/src/ rebuilds synchronously —
        // the SDK awaits this hook's result before the turn proceeds — so
        // an esbuild failure reaches the agent as tool feedback in the SAME
        // turn (decision:'block' + reason, fed back to Claude per the SDK's
        // PostToolUse contract) instead of needing a separate Read of
        // build-errors.txt. That file is still written (see
        // rebuildWidgetSource) as a durable, inspectable artifact and named
        // in the system prompt as a fallback if a hook round ever doesn't
        // fire in time.
        hooks: {
          PostToolUse: [
            {
              matcher: 'Write|Edit',
              hooks: [
                async hookInput =>
                  handleWidgetBuildHook(hookInput, this.store, state),
              ],
            },
          ],
        },
        settingSources: [],
        maxTurns: MAX_TURNS,
        ...(this.readAgentSessionId()
          ? {resume: this.readAgentSessionId()}
          : {}),
      },
    });

    let finalText = '';
    for await (const sdkMessage of stream) {
      finalText = this.handleMessage(sdkMessage, state, turnId) ?? finalText;
    }

    if (finalText) {
      state.appendChatMessage('agent', finalText, scope);
    }
    state.emit({type: 'agent-status', turnId, status: 'done'});
  }

  private handleMessage(
    sdkMessage: SDKMessage,
    state: AuthoringState,
    turnId: string,
  ): string | undefined {
    if (sdkMessage.type === 'system' && sdkMessage.subtype === 'init') {
      this.writeAgentSessionId(sdkMessage.session_id);
      return undefined;
    }
    if (sdkMessage.type === 'assistant') {
      for (const block of sdkMessage.message.content) {
        if (block.type === 'tool_use') {
          state.emit({
            type: 'agent-status',
            turnId,
            status: 'tool',
            detail: describeToolUse(block.name, block.input),
          });
        } else if (block.type === 'text' && block.text.trim()) {
          state.emit({
            type: 'agent-status',
            turnId,
            status: 'text',
            detail: truncate(block.text.trim(), 160),
          });
        }
      }
      return undefined;
    }
    if (sdkMessage.type === 'result') {
      return 'result' in sdkMessage && typeof sdkMessage.result === 'string'
        ? sdkMessage.result
        : undefined;
    }
    return undefined;
  }

  // Conversation continuity across turns: resume the same SDK session so the
  // agent remembers the outline discussion when the author says "build it".
  private get sessionIdFile(): string {
    return path.join(this.store.root, 'agent-session.json');
  }

  private readAgentSessionId(): string | undefined {
    try {
      const raw = fs.readFileSync(this.sessionIdFile, 'utf8');
      return (JSON.parse(raw) as {sessionId?: string}).sessionId;
    } catch {
      return undefined;
    }
  }

  private writeAgentSessionId(sessionId: string): void {
    fs.writeFileSync(this.sessionIdFile, `${JSON.stringify({sessionId})}\n`);
  }
}

/**
 * After a Write/Edit under widgets/<id>/src/, rebuild that widget before the
 * turn continues. A failing build returns decision:'block' — the SDK feeds
 * `reason` back to Claude as this tool call's result and, with
 * continue:true, lets the turn carry on — so the agent sees the exact
 * esbuild error immediately and can fix it in the same turn. A file outside
 * any widget's src/ (curriculum ops, a legacy widget.html) is a no-op.
 */
async function handleWidgetBuildHook(
  input: HookInput,
  store: SessionStore,
  state: AuthoringState,
): Promise<SyncHookJSONOutput> {
  if (
    input.hook_event_name !== 'PostToolUse' ||
    (input.tool_name !== 'Write' && input.tool_name !== 'Edit')
  ) {
    return {};
  }
  const filePath = (input.tool_input as {file_path?: unknown} | undefined)
    ?.file_path;
  const widgetId =
    typeof filePath === 'string'
      ? widgetIdFromSourcePath(filePath, store)
      : undefined;
  if (!widgetId) {
    return {};
  }

  const title = state.findWidget(widgetId)?.title ?? widgetId;
  const result = await rebuildWidgetSource(store, widgetId, title);
  if (!result) {
    return {}; // no src/ yet — canUseTool would have already blocked this
  }
  if (result.ok) {
    state.notifyWidgetSourceChanged(widgetId);
    return {};
  }
  return {
    decision: 'block',
    reason:
      `Widget ${widgetId} failed to build:\n\n${result.errorText}\n\n` +
      'Fix the error and write again. Learners still see the last working ' +
      `build — nothing changed for them. The same error is also saved at ` +
      `widgets/${widgetId}/build-errors.txt.`,
    continue: true,
  };
}

/**
 * Resolves a Write/Edit's file_path to a widget id, but only when the path
 * is inside that widget's src/ tree — the one thing handleWidgetBuildHook
 * needs to know before it is worth an esbuild run. canUseTool has already
 * confined the path to store.widgetsDir by the time this runs, so this
 * checks shape, not containment.
 */
function widgetIdFromSourcePath(
  filePath: string,
  store: SessionStore,
): string | undefined {
  const resolved = path.resolve(store.root, filePath);
  const relative = path.relative(store.widgetsDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return undefined;
  }
  const [widgetId, srcSegment, ...rest] = relative.split(path.sep);
  if (!widgetId || srcSegment !== 'src' || rest.length === 0) {
    return undefined;
  }
  return widgetId;
}

/** File tools are confined to the session; writes to widget source only. */
function guardFileTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  store: SessionStore,
):
  | {behavior: 'allow'; updatedInput: Record<string, unknown>}
  | {behavior: 'deny'; message: string} {
  if (toolName.startsWith('mcp__curriculum__') || toolName === 'TodoWrite') {
    return {behavior: 'allow', updatedInput: toolInput};
  }

  const READ_TOOLS = new Set(['Read', 'Glob', 'Grep']);
  // This SDK's file tools are Read/Write/Edit/Glob/Grep; there is no
  // MultiEdit here, so guarding against it was dead code.
  const WRITE_TOOLS = new Set(['Write', 'Edit']);
  if (!READ_TOOLS.has(toolName) && !WRITE_TOOLS.has(toolName)) {
    return {behavior: 'deny', message: `${toolName} is not available here.`};
  }

  const rawPath =
    (toolInput.file_path as string | undefined) ??
    (toolInput.path as string | undefined) ??
    store.root;
  const resolved = path.resolve(store.root, rawPath);
  const boundary = WRITE_TOOLS.has(toolName) ? store.widgetsDir : store.root;
  if (resolved !== boundary && !resolved.startsWith(`${boundary}${path.sep}`)) {
    return {
      behavior: 'deny',
      message: `${toolName} is confined to ${boundary}.`,
    };
  }
  if (!isWithinRealBoundary(resolved, boundary)) {
    return {
      behavior: 'deny',
      message: `${toolName} is confined to ${boundary}.`,
    };
  }
  return {behavior: 'allow', updatedInput: toolInput};
}

/**
 * path.resolve above is purely lexical: a symlink placed inside the boundary
 * (or as the boundary itself) can point anywhere on disk, and the lexical
 * check alone would wave that through. Resolve symlinks and re-test
 * containment against the boundary's own real path. The target of a Write
 * may not exist yet, so symlinks are resolved on the nearest ancestor
 * directory that does exist, and the removed suffix is reattached lexically.
 */
function isWithinRealBoundary(resolved: string, boundary: string): boolean {
  try {
    const ancestor = nearestExistingAncestor(resolved);
    const realAncestor = fs.realpathSync.native(ancestor);
    const realBoundary = fs.realpathSync.native(boundary);
    const realResolved = path.join(
      realAncestor,
      resolved.slice(ancestor.length),
    );
    return (
      realResolved === realBoundary ||
      realResolved.startsWith(`${realBoundary}${path.sep}`)
    );
  } catch {
    // Symlink resolution failed for a reason other than a missing target
    // (permissions, a race) — fail closed rather than trust the lexical
    // check alone.
    return false;
  }
}

function nearestExistingAncestor(target: string): string {
  let candidate = target;
  while (!fs.existsSync(candidate)) {
    const parent = path.dirname(candidate);
    if (parent === candidate) {
      return candidate;
    }
    candidate = parent;
  }
  return candidate;
}

function ok(payload: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof payload === 'string' ? payload : JSON.stringify(payload),
      },
    ],
  };
}

function fail(error: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  };
}

const draftId = (prefix: string) =>
  `draft-${prefix}-${randomUUID().slice(0, 8)}`;

/**
 * The semantic curriculum ops, closed over one turn's state. Returns the
 * MCP server alongside the tool names actually registered on it — the
 * caller's `allowedTools` derives from `toolNames` rather than a
 * hand-maintained parallel list, which is what a prior version of this file
 * got wrong (`update_level_instructions` was defined here but absent from
 * that list; harmless only because canUseTool's guardFileTool waves through
 * every mcp__curriculum__* name regardless, which is also why the drift
 * went unnoticed).
 */
function buildCurriculumServer(
  state: AuthoringState,
  store: SessionStore,
  catalog: LevelCatalog,
): {server: ReturnType<typeof createSdkMcpServer>; toolNames: string[]} {
  const apply = (
    body: Parameters<AuthoringState['applyCurriculumChange']>[0],
  ) => state.applyCurriculumChange(body, 'agent');

  /** Appends the auto-narrated one-line check verdict (WOW plan §5 item 2)
   * to a level-mutating tool's normal result, when the level's current
   * wire properties can be checked. `properties` undefined (e.g. the level
   * isn't registered yet) is a silent no-op — never a tool error over a
   * narration nicety. */
  const okWithCheck = (
    payload: Record<string, unknown>,
    properties: Record<string, unknown> | undefined,
  ) => {
    const base = ok(payload);
    if (!properties || !isMazeFamilyLevel(properties)) {
      return base;
    }
    const verdict = checkImportedMazeLevel({properties});
    return {
      content: [...base.content, {type: 'text' as const, text: oneLineCheckVerdict(verdict)}],
    };
  };

  const tools = [
      tool(
        'get_curriculum',
        'Current curriculum outline: courses, units, lessons (with goals and experience counts).',
        {},
        async () => ok(outline(state)),
      ),
      tool(
        'get_lesson',
        'Full detail of one lesson including its ordered experiences.',
        {lessonId: z.string()},
        async ({lessonId}) => {
          const found = findLesson(state, lessonId);
          if (!found) {
            return fail(`no lesson ${lessonId}`);
          }
          return ok(lessonDetail(found.lesson, state));
        },
      ),
      tool(
        'create_course',
        'Create a new draft course. Returns the new courseId.',
        {displayName: z.string(), gradeLevels: z.string().optional()},
        async ({displayName, gradeLevels}) => {
          const id = draftId('course');
          apply({
            op: 'createCourse',
            course: {
              id,
              displayName,
              origin: 'draft',
              ...(gradeLevels ? {gradeLevels} : {}),
            },
          });
          return ok({courseId: id});
        },
      ),
      tool(
        'create_unit',
        'Create a unit in a course. Returns the new unitId.',
        {
          courseId: z.string(),
          displayName: z.string(),
          overview: z.string().optional(),
          position: z.number().int().optional(),
        },
        async ({courseId, displayName, overview, position}) => {
          const id = draftId('unit');
          apply({
            op: 'createUnit',
            courseId,
            unit: {
              id,
              displayName,
              origin: 'draft',
              ...(overview ? {overview} : {}),
            },
            ...(position !== undefined ? {position} : {}),
          });
          return ok({unitId: id});
        },
      ),
      tool(
        'create_lesson',
        'Create a lesson (outline first: goal, duration, outline steps, expected outcome — no experiences yet). Returns the new lessonId.',
        {
          unitId: z.string(),
          displayName: z.string(),
          goal: z.string().optional(),
          durationMinutes: z.number().int().optional(),
          overview: z.string().optional(),
          outline: z.array(z.string()).optional(),
          expectedOutcome: z.string().optional(),
          position: z.number().int().optional(),
        },
        async ({unitId, displayName, position, ...rest}) => {
          const id = draftId('lesson');
          apply({
            op: 'createLesson',
            unitId,
            lesson: {id, displayName, origin: 'draft', ...compact(rest)},
            ...(position !== undefined ? {position} : {}),
          });
          return ok({lessonId: id});
        },
      ),
      tool(
        'update_lesson',
        'Update lesson fields (displayName, goal, durationMinutes, overview, outline, expectedOutcome).',
        {
          lessonId: z.string(),
          displayName: z.string().optional(),
          goal: z.string().optional(),
          durationMinutes: z.number().int().optional(),
          overview: z.string().optional(),
          outline: z.array(z.string()).optional(),
          expectedOutcome: z.string().optional(),
        },
        async ({lessonId, ...patch}) => {
          apply({op: 'updateLesson', lessonId, patch: compact(patch)});
          return ok({lessonId});
        },
      ),
      tool(
        'insert_content',
        'Insert learner-facing instructional content (markdown) into a lesson at a 0-based position.',
        {
          lessonId: z.string(),
          position: z.number().int(),
          title: z.string(),
          markdown: z.string(),
        },
        async ({lessonId, position, title, markdown}) => {
          const id = draftId('exp');
          apply({
            op: 'insertExperience',
            lessonId,
            position,
            experience: {
              id,
              kind: 'content',
              origin: 'draft',
              title,
              markdown,
            },
          });
          return ok({experienceId: id});
        },
      ),
      tool(
        'update_content',
        'Update a content experience (title and/or markdown). Works on imported markdown pages too.',
        {
          experienceId: z.string(),
          title: z.string().optional(),
          markdown: z.string().optional(),
        },
        async ({experienceId, ...patch}) => {
          apply({op: 'updateContent', experienceId, patch: compact(patch)});
          return ok({experienceId});
        },
      ),
      tool(
        'move_experience',
        'Move an experience to a new 0-based position, optionally to another lesson.',
        {
          lessonId: z.string(),
          experienceId: z.string(),
          toPosition: z.number().int(),
          toLessonId: z.string().optional(),
        },
        async args => {
          apply({op: 'moveExperience', ...compact(args)} as never);
          return ok({moved: true});
        },
      ),
      tool(
        'remove_experience',
        'Remove an experience from a lesson.',
        {lessonId: z.string(), experienceId: z.string()},
        async ({lessonId, experienceId}) => {
          apply({op: 'removeExperience', lessonId, experienceId});
          return ok({removed: true});
        },
      ),
      tool(
        'search_existing_levels',
        'Search real Code.org levels available to attach (Oceans/Fish, Music, videos). Case-insensitive substring.',
        {query: z.string()},
        async ({query: q}) => ok({levels: catalog.searchLevels(q)}),
      ),
      tool(
        'attach_existing_level',
        'Attach a real existing level (by exact levelKey from search) into a lesson at a 0-based position.',
        {
          lessonId: z.string(),
          levelKey: z.string(),
          position: z.number().int(),
        },
        async ({lessonId, levelKey, position}) => {
          apply({op: 'attachExistingLevel', lessonId, levelKey, position});
          return ok({attached: levelKey});
        },
      ),
      tool(
        'create_widget',
        'Create an interactive widget experience: registers the descriptor and inserts it into the lesson. Then WRITE the TSX component at the returned sourcePath — it builds automatically (esbuild) into the served document; do not write HTML directly.',
        {
          lessonId: z.string(),
          position: z.number().int(),
          toolName: z
            .string()
            .regex(/^[a-z][a-z0-9_]*$/, 'snake_case tool name'),
          title: z.string(),
          description: z.string(),
          inputSchema: z.record(z.string(), z.unknown()).optional(),
          defaultInput: z.record(z.string(), z.unknown()).optional(),
          eventTypes: z.array(z.string()).optional(),
        },
        async args => {
          const widgetId = draftId('widget');
          const descriptor: WidgetDescriptor = {
            id: widgetId,
            toolName: args.toolName,
            title: args.title,
            description: args.description,
            inputSchema: args.inputSchema ?? {
              type: 'object',
              properties: {},
            },
            resourceUri: `ui://widgets/${widgetId}.html`,
            visibility: ['model', 'app'],
            network: 'none',
            ...(args.eventTypes ? {eventTypes: args.eventTypes} : {}),
          };
          apply({op: 'createWidget', descriptor});
          const experienceId = draftId('exp');
          apply({
            op: 'insertExperience',
            lessonId: args.lessonId,
            position: args.position,
            experience: {
              id: experienceId,
              kind: 'widget',
              origin: 'draft',
              title: args.title,
              widgetId,
              toolName: args.toolName,
              description: args.description,
              ...(args.defaultInput ? {defaultInput: args.defaultInput} : {}),
            },
          });
          // Seed a minimal-but-valid entry so the dir exists for the Write
          // and an unmodified seed still builds (the watcher/hook can run
          // before the agent's own Write lands).
          const srcDir = path.join(store.widgetDir(widgetId), 'src');
          fs.mkdirSync(srcDir, {recursive: true});
          fs.writeFileSync(path.join(srcDir, 'index.tsx'), SEED_WIDGET_TSX);
          return ok({
            widgetId,
            experienceId,
            sourcePath: `widgets/${widgetId}/src/index.tsx`,
          });
        },
      ),
      tool(
        'create_level',
        "Create a Maze puzzle level: a grid plus a typed block solution program (never hand-written Blockly XML). Rejected with a specific, correctable reason unless the solution actually solves the grid, uses only toolbox block types valid for the level's skin, and stays within the block-count budget. skin defaults to 'birds' (plain Maze); 'farmer'/'bee'/'collector' additionally unlock fill+dig / getNectar+makeHoney / collect in the toolbox — flavor blocks that play an animation but never affect whether the goal is reached. Add definition.startProgram to make it a debugging level — see the system prompt's Debugging levels section for the five-clause gate and house style. On success, inserts it into the lesson and returns levelId.",
        {
          lessonId: z.string(),
          position: z.number().int(),
          title: z.string(),
          definition: MazeLevelDefinitionSchema,
        },
        async ({lessonId, position, title, definition}) => {
          const result = createMazeLevel(state, store, {
            lessonId,
            position,
            title,
            definition,
            actor: 'agent',
          });
          if (!result.ok) {
            return fail(`level not created — ${result.reason}`);
          }
          return okWithCheck(
            {
              levelId: result.levelId,
              experienceId: result.experienceId,
              levelNumericId: result.levelNumericId,
              ...(result.debugNarrative
                ? {debugNarrative: result.debugNarrative}
                : {}),
            },
            state.getLevelProperties(String(result.levelNumericId)),
          );
        },
      ),
      tool(
        'update_level',
        'Patch a level created by create_level (grid, blocks, instructions, title, startProgram, ...). Re-runs the solvability gate (or, when the merged definition has a startProgram, the full five-clause debugging gate) against the merged definition before applying — a change that breaks it is rejected with the specific reason and nothing changes.',
        {
          levelId: z.string(),
          title: z.string().optional(),
          patch: MazeLevelDefinitionPatchSchema,
        },
        async ({levelId, title, patch}) => {
          const existing = store.readLevelDefinition(levelId);
          if (!existing) {
            return fail(
              `no level ${levelId} (create it with create_level first)`,
            );
          }
          if (existing.visuallyEdited) {
            return fail(
              `level ${levelId} was edited in the level editor; its grid and blocks no longer round-trip to a typed definition. Edit it there, or ask the author to re-create it.`,
            );
          }
          const next = {...existing, ...patch};
          let debugNarrative: string | undefined;
          if (next.startProgram) {
            const gate = verifyDebugMazeLevel({
              ...next,
              startProgram: next.startProgram,
            });
            if (!gate.ok) {
              return fail(`level not updated — ${gate.reason}`);
            }
            debugNarrative = gate.narrative;
          } else {
            const gate = verifyMazeLevelSolvable(next);
            if (!gate.ok) {
              return fail(`level not updated — ${gate.reason}`);
            }
          }
          const found = findLevel(state, `draft:${levelId}`);
          if (!found) {
            return fail(`level ${levelId} is not attached to any lesson`);
          }
          const {experienceId, levelNumericId} = found;
          store.writeLevelDefinition(levelId, next);
          const wireProperties = buildMazeLevelWireProperties(
            levelNumericId,
            `draft:${levelId}`,
            next,
          );
          state.registerLevelProperties({[String(levelNumericId)]: wireProperties});
          if (title !== undefined) {
            apply({op: 'updateLevel', experienceId, patch: {title}});
          } else {
            state.notifyLevelPropertiesChanged();
          }
          return okWithCheck(
            {
              levelId,
              levelNumericId,
              ...(debugNarrative ? {debugNarrative} : {}),
            },
            wireProperties,
          );
        },
      ),
      tool(
        'update_level_instructions',
        "Reword or add the short_instructions/long_instructions shown to the learner on any attached level — imported (lb:) or draft, Maze/Music/Fish alike. Layers an override on top of the level's own source; never rewrites the imported file or the draft definition. Use the selected experience's id from [author context] unless the author names a different one.",
        {
          experienceId: z.string(),
          shortInstructions: z.string().optional(),
          longInstructions: z.string().optional(),
        },
        async ({experienceId, shortInstructions, longInstructions}) => {
          if (shortInstructions === undefined && longInstructions === undefined) {
            return fail('provide shortInstructions and/or longInstructions');
          }
          const experience = findExperienceById(state, experienceId);
          if (!experience) {
            return fail(`no experience ${experienceId}`);
          }
          if (experience.kind !== 'existingLevel') {
            return fail(
              `experience ${experienceId} is not a level (kind: ${experience.kind})`,
            );
          }
          apply({
            op: 'overrideLevelInstructions',
            experienceId,
            patch: {
              ...(shortInstructions !== undefined ? {shortInstructions} : {}),
              ...(longInstructions !== undefined ? {longInstructions} : {}),
            },
          });
          return okWithCheck(
            {experienceId},
            experience.levelNumericId === undefined
              ? undefined
              : state.getLevelProperties(String(experience.levelNumericId)),
          );
        },
      ),
      tool(
        'set_adaptive_policy',
        'Set author-defined constraints for the optional learner-time tutor on a lesson.',
        {
          lessonId: z.string(),
          tutorGuidance: z.string().optional(),
          allowRepeat: z.boolean().optional(),
          alternatives: z.record(z.string(), z.array(z.string())).optional(),
        },
        async ({lessonId, ...policy}) => {
          apply({
            op: 'updateLesson',
            lessonId,
            patch: {adaptivePolicy: compact(policy)},
          });
          return ok({lessonId});
        },
      ),
      tool(
        'get_level',
        "See a level's real contents: grid, toolbox, start/solution block programs (decoded to the same JSON shape create_level accepts), instructions, skin, goals, flower type, and the current check verdict. Works on any attached Maze/Karel-family level, imported or draft. Give experienceId (the selected experience, or one from get_lesson) or levelKey.",
        {
          experienceId: z.string().optional(),
          levelKey: z.string().optional(),
        },
        async ({experienceId, levelKey}) => {
          const experience = experienceId
            ? findExperienceById(state, experienceId)
            : levelKey
              ? findExperienceByLevelKey(state, levelKey)
              : undefined;
          if (!experience) {
            return fail('provide experienceId or levelKey identifying an attached level');
          }
          if (experience.kind !== 'existingLevel') {
            return fail(
              `experience ${experience.id} is not a level (kind: ${experience.kind})`,
            );
          }
          if (experience.levelNumericId === undefined) {
            return fail(`level ${experience.id} has no numeric id registered yet`);
          }
          const properties = state.getLevelProperties(String(experience.levelNumericId));
          if (!properties) {
            return fail(
              `no level_properties registered for numeric id ${experience.levelNumericId}`,
            );
          }
          return ok(
            buildLevelView({
              experience,
              properties,
              visuallyEdited: readVisuallyEdited(store, experience),
            }),
          );
        },
      ),
      tool(
        'check_level',
        'Run the machine check on an attached Maze/Karel-family level: does the toolbox offer every block the solution uses, and — when the block set is fully simulatable — does the solution actually solve the grid/goal. Returns ok, mode (simulated = full run, palette = toolbox coverage only), and the reason when not ok.',
        {experienceId: z.string()},
        async ({experienceId}) => {
          const experience = findExperienceById(state, experienceId);
          if (!experience) {
            return fail(`no experience ${experienceId}`);
          }
          if (experience.kind !== 'existingLevel' || experience.levelNumericId === undefined) {
            return fail(`experience ${experienceId} is not a checkable level`);
          }
          const properties = state.getLevelProperties(String(experience.levelNumericId));
          if (!properties) {
            return fail(
              `no level_properties registered for numeric id ${experience.levelNumericId}`,
            );
          }
          return ok(checkImportedMazeLevel({properties}));
        },
      ),
    ].map(withErrors);

  return {
    server: createSdkMcpServer({name: 'curriculum', version: '1.0.0', tools}),
    toolNames: tools.map(t => t.name),
  };
}

// tool() has no built-in error envelope; a thrown reducer error (bad id, bad
// position) should come back to the model as a correctable tool error, not
// kill the turn.
function withErrors<
  T extends {handler: (...args: never[]) => Promise<unknown>},
>(sdkTool: T): T {
  const original = sdkTool.handler;
  return {
    ...sdkTool,
    handler: async (...args: never[]) => {
      try {
        return await original(...args);
      } catch (error) {
        return fail(error);
      }
    },
  };
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;
}

function outline(state: AuthoringState) {
  return state.getSnapshot().courses.map(course => ({
    courseId: course.id,
    displayName: course.displayName,
    origin: course.origin,
    gradeLevels: course.gradeLevels,
    units: course.units.map(unit => ({
      unitId: unit.id,
      displayName: unit.displayName,
      lessons: unit.lessons.map(lesson => ({
        lessonId: lesson.id,
        displayName: lesson.displayName,
        origin: lesson.origin,
        goal: lesson.goal,
        durationMinutes: lesson.durationMinutes,
        outline: lesson.outline,
        experienceCount: lesson.experiences.length,
      })),
    })),
  }));
}

function findLevel(
  state: AuthoringState,
  levelKey: string,
): {experienceId: string; levelNumericId: number} | undefined {
  for (const course of state.getSnapshot().courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const experience of lesson.experiences) {
          if (
            experience.kind === 'existingLevel' &&
            experience.levelKey === levelKey &&
            experience.levelNumericId !== undefined
          ) {
            return {
              experienceId: experience.id,
              levelNumericId: experience.levelNumericId,
            };
          }
        }
      }
    }
  }
  return undefined;
}

function findExperienceById(
  state: AuthoringState,
  experienceId: string,
): Experience | undefined {
  for (const course of state.getSnapshot().courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        const experience = lesson.experiences.find(e => e.id === experienceId);
        if (experience) {
          return experience;
        }
      }
    }
  }
  return undefined;
}

function findLesson(state: AuthoringState, lessonId: string) {
  for (const course of state.getSnapshot().courses) {
    for (const unit of course.units) {
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return {course, unit, lesson};
      }
    }
  }
  return undefined;
}

function lessonDetail(lesson: Lesson, state: AuthoringState) {
  return {
    lessonId: lesson.id,
    displayName: lesson.displayName,
    goal: lesson.goal,
    durationMinutes: lesson.durationMinutes,
    overview: lesson.overview,
    outline: lesson.outline,
    expectedOutcome: lesson.expectedOutcome,
    adaptivePolicy: lesson.adaptivePolicy,
    experiences: lesson.experiences.map((experience, index) =>
      experienceSummary(experience, index, state),
    ),
  };
}

function experienceSummary(
  experience: Experience,
  position: number,
  state: AuthoringState,
) {
  const base = {
    position,
    experienceId: experience.id,
    kind: experience.kind,
    origin: experience.origin,
    title: experience.title,
  };
  if (experience.kind === 'content') {
    return {...base, markdown: truncate(experience.markdown, 400)};
  }
  if (experience.kind === 'existingLevel') {
    return {
      ...base,
      levelKey: experience.levelKey,
      levelType: experience.levelType,
      runtime: experience.runtime,
      // Was missing entirely (WOW plan §1.3) — an agent reading get_lesson
      // had no way to even know a level was worth a get_level call, let
      // alone which numeric id to give it.
      levelNumericId: experience.levelNumericId,
    };
  }
  const descriptor = state.findWidget(experience.widgetId);
  return {
    ...base,
    widgetId: experience.widgetId,
    toolName: experience.toolName,
    description: experience.description,
    defaultInput: experience.defaultInput,
    inputSchema: descriptor?.inputSchema,
    sourcePath: `widgets/${experience.widgetId}/widget.html`,
  };
}

function describeToolUse(name: string, input: unknown): string {
  const short = name.replace(/^mcp__curriculum__/, '');
  const args = input as Record<string, unknown> | undefined;
  const hint =
    (args?.displayName as string) ??
    (args?.title as string) ??
    (args?.levelKey as string) ??
    (args?.query as string) ??
    (args?.lessonId as string) ??
    (args?.file_path as string) ??
    '';
  return hint ? `${short}: ${truncate(String(hint), 80)}` : short;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function enrichScope(
  scope: AgentTurnInput['scope'],
  state: AuthoringState,
  store: SessionStore,
): Parameters<typeof describeScope>[0] {
  const snapshot = state.getSnapshot();
  const course = snapshot.courses.find(c => c.id === scope.courseId);
  const unit = course?.units.find(u => u.id === scope.unitId);
  const lesson = unit?.lessons.find(l => l.id === scope.lessonId);
  const experience = lesson?.experiences.find(e => e.id === scope.experienceId);
  return {
    ...scope,
    courseName: course?.displayName,
    unitName: unit?.displayName,
    lessonName: lesson?.displayName,
    experienceTitle: experience?.title,
    experienceLevelDetail: experience && describeLevelDetail(experience, store),
  };
}

/**
 * One line naming what kind of level is selected and whether get_level/
 * update_level can actually edit it (WOW plan §3 item 1): a draft level's
 * editability hinges on its on-disk typed definition surviving untouched by
 * the visual editor (AuthoringState.ts's markDraftLevelVisuallyEdited), and
 * an imported level has no such definition at all — the agent otherwise has
 * no way to know which of "this level" it's looking at.
 */
function describeLevelDetail(
  experience: Experience,
  store: SessionStore,
): string | undefined {
  if (experience.kind !== 'existingLevel') {
    return undefined;
  }
  const parts = [`${experience.levelType} level`];
  if (experience.origin === 'draft') {
    const levelId = experience.levelKey.startsWith('draft:')
      ? experience.levelKey.slice('draft:'.length)
      : undefined;
    const definition = levelId ? store.readLevelDefinition(levelId) : undefined;
    if (definition) {
      parts.push(
        definition.visuallyEdited
          ? `draft (typed definition ${levelId}, visually edited — edit via the level editor, not update_level)`
          : `draft (typed definition ${levelId}, editable via update_level)`,
      );
    } else {
      parts.push('draft');
    }
  } else {
    parts.push('imported (levelbuilder)');
  }
  if (experience.levelNumericId !== undefined) {
    parts.push(`numericId ${experience.levelNumericId}`);
  }
  return parts.join(', ');
}

function findExperienceByLevelKey(
  state: AuthoringState,
  levelKey: string,
): ExistingLevelExperience | undefined {
  for (const course of state.getSnapshot().courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const experience of lesson.experiences) {
          if (experience.kind === 'existingLevel' && experience.levelKey === levelKey) {
            return experience;
          }
        }
      }
    }
  }
  return undefined;
}

/** A draft Maze level's on-disk MazeLevelDefinition carries this flag once
 * the visual level editor has touched it (AuthoringState.ts); an imported
 * level never has such a definition, so it's always false there. */
function readVisuallyEdited(
  store: SessionStore,
  experience: ExistingLevelExperience,
): boolean {
  if (experience.origin !== 'draft' || !experience.levelKey.startsWith('draft:')) {
    return false;
  }
  const levelId = experience.levelKey.slice('draft:'.length);
  return store.readLevelDefinition(levelId)?.visuallyEdited ?? false;
}
