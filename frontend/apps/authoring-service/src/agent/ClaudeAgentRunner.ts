import {
  createSdkMcpServer,
  query,
  tool,
  type SDKMessage,
} from '@anthropic-ai/claude-agent-sdk';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {z} from 'zod';

import type {
  Experience,
  Lesson,
  WidgetDescriptor,
} from '../authoring/model.js';
import type {LevelCatalog} from '../boot/levelCatalog.js';
import type {AuthoringState} from '../state/AuthoringState.js';
import type {SessionStore} from '../store/SessionStore.js';

import type {AgentRunner, AgentTurnInput} from './AgentRunner.js';
import {AUTHORING_SYSTEM_PROMPT, describeScope} from './systemPrompt.js';

const MODEL = 'sonnet';
const MAX_TURNS = 40;

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

    const curriculum = buildCurriculumServer(state, this.store, this.catalog);
    const prompt = `${describeScope(enrichScope(scope, state))}${message}`;

    const stream = query({
      prompt,
      options: {
        model: MODEL,
        cwd: this.store.root,
        systemPrompt: AUTHORING_SYSTEM_PROMPT,
        mcpServers: {curriculum},
        // The semantic ops are pre-approved; everything else funnels through
        // canUseTool, which confines file tools to the session workspace.
        allowedTools: CURRICULUM_TOOL_NAMES.map(
          name => `mcp__curriculum__${name}`,
        ),
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
    fs.writeFileSync(
      this.sessionIdFile,
      `${JSON.stringify({sessionId})}\n`,
    );
  }
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
    const realResolved = path.join(realAncestor, resolved.slice(ancestor.length));
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

const CURRICULUM_TOOL_NAMES = [
  'get_curriculum',
  'get_lesson',
  'create_course',
  'create_unit',
  'create_lesson',
  'update_lesson',
  'insert_content',
  'update_content',
  'move_experience',
  'remove_experience',
  'search_existing_levels',
  'attach_existing_level',
  'create_widget',
  'set_adaptive_policy',
];

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

/** The semantic curriculum ops, closed over one turn's state. */
function buildCurriculumServer(
  state: AuthoringState,
  store: SessionStore,
  catalog: LevelCatalog,
) {
  const apply = (body: Parameters<AuthoringState['applyCurriculumChange']>[0]) =>
    state.applyCurriculumChange(body, 'agent');

  return createSdkMcpServer({
    name: 'curriculum',
    version: '1.0.0',
    tools: [
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
        'Create an interactive widget experience: registers the descriptor and inserts it into the lesson. Then WRITE the self-contained HTML document at the returned sourcePath.',
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
          // Seed an empty source so the store dir exists for the Write.
          store.writeWidgetSource(widgetId, '');
          return ok({
            widgetId,
            experienceId,
            sourcePath: `widgets/${widgetId}/widget.html`,
          });
        },
      ),
      tool(
        'set_adaptive_policy',
        'Set author-defined constraints for the optional learner-time tutor on a lesson.',
        {
          lessonId: z.string(),
          tutorGuidance: z.string().optional(),
          allowRepeat: z.boolean().optional(),
          alternatives: z
            .record(z.string(), z.array(z.string()))
            .optional(),
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
    ].map(withErrors),
  });
}

// tool() has no built-in error envelope; a thrown reducer error (bad id, bad
// position) should come back to the model as a correctable tool error, not
// kill the turn.
function withErrors<T extends {handler: (...args: never[]) => Promise<unknown>}>(
  sdkTool: T,
): T {
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
): Parameters<typeof describeScope>[0] {
  const snapshot = state.getSnapshot();
  const course = snapshot.courses.find(c => c.id === scope.courseId);
  const unit = course?.units.find(u => u.id === scope.unitId);
  const lesson = unit?.lessons.find(l => l.id === scope.lessonId);
  const experience = lesson?.experiences.find(
    e => e.id === scope.experienceId,
  );
  return {
    ...scope,
    courseName: course?.displayName,
    unitName: unit?.displayName,
    lessonName: lesson?.displayName,
    experienceTitle: experience?.title,
  };
}
