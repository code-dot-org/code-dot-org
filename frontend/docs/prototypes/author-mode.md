# Author Mode prototype

Curriculum authoring inside the learner experience. No Rails process. One
shared Experience abstraction serves the authoring agent, deterministic
curriculum playback, and an optional learner-time AI tutor.

Status: prototype on branch `ngfp/author-mode-prototype`. Nothing here is
production machinery.

## Thesis under test

Authoring-time (an AI coding agent creates/edits curriculum) and learner-time
(an AI tutor selects/configures already-authored activities) are mirror images
of one platform abstraction: the Experience. The authoring agent creates the
world; the learner-time tutor operates inside the published world. Both must
consume the exact same Experience representation and runtime, and the
deterministic (no-AI, offline-capable) path must work with both switched off.

## Pieces

```
frontend/packages/authoring        @code-dot-org/authoring       domain model, change log, Levelbuilder importer (pure TS)
frontend/packages/widget-runtime   @code-dot-org/widget-runtime  sandboxed widget host (MCP Apps shape), adapted from PR #74649
frontend/apps/authoring-service    @code-dot-org/authoring-service  Node service: file-backed drafts, embedded Claude agent, SSE
frontend/apps/studio               new /author routes: learner experience + author affordances + AI sidebar
```

Studio runs standalone (`VITE_API_MODE=msw yarn dev`, port 3036). The
authoring service is a separate local Node process (port 3737); Studio reaches
it through a Vite dev proxy at `/authoring-api`. Real labs (Oceans, Music)
mount through the existing `LabHost`; their level properties are served by an
MSW fixture that proxies to the authoring service, which derives them from the
real `.level` files at import time.

## Real curriculum, no Rails

We import `k5-ai-data-2024` ("How AI Makes Decisions", grades 3-5, CSF) from
its on-disk Levelbuilder serialization: `dashboard/config/scripts_json/
k5-ai-data-2024.script_json`, plus the referenced level definitions in
`dashboard/config/levels/custom/**.level` (XML) and `dashboard/config/
scripts/*.{multi,match,external,bubble_choice,level_group}` (DSL). The import
is read-only projection. Identity is preserved: course `name`, offering `key`,
script `name`, lesson `key`, and level `name` stay the exact strings
Levelbuilder's own seeding uses as natural keys. Edits never rewrite the
source files; they accumulate as a `CurriculumChange` log from which a future
Rails write adapter is obvious.

Numeric level ids do not exist in the serialized files (they are DB-assigned),
so the importer assigns synthetic numeric ids for the `LevelProperties` wire
shape LabHost consumes. The level `name` remains the real identity.

## Domain model (contract)

Lives in `@code-dot-org/authoring` (`src/model/types.ts`). Deliberately small.

```ts
export type Origin = 'levelbuilder' | 'draft';
// Draft ids are `draft:<uuid>`; imported ids embed the real Levelbuilder keys.

export interface CourseModel {
  id: string;              // course name, e.g. 'k5-ai-data-2024', or draft:<uuid>
  offeringKey?: string;    // course_offerings key, e.g. 'k5-ai-data'
  displayName: string;
  gradeLevels?: string;
  origin: Origin;
  units: Unit[];
}

export interface Unit {
  id: string;              // script name, e.g. 'k5-ai-data-2024', or draft:<uuid>
  displayName: string;
  origin: Origin;
  overview?: string;       // markdown
  lessons: Lesson[];
}

export interface Lesson {
  id: string;              // `lb:<script>:<lessonKey>` or draft:<uuid>
  lessonKey?: string;      // real Levelbuilder lesson.key when imported
  displayName: string;
  origin: Origin;
  goal?: string;           // pedagogical intent (outline-first authoring)
  durationMinutes?: number;
  overview?: string;       // learner-facing markdown (student_overview)
  outline?: string[];      // planned high-level sequence, pre-realization
  expectedOutcome?: string;
  experiences: Experience[];
  adaptivePolicy?: AdaptivePolicy;
}

interface ExperienceBase {
  id: string;              // `lb:<levelKey>` or draft:<uuid>
  origin: Origin;
  title?: string;
}

/** Learner-facing instructional content authored directly (markdown). */
export interface ContentExperience extends ExperienceBase {
  kind: 'content';
  markdown: string;
}

/** A real Levelbuilder level, identity preserved. */
export interface ExistingLevelExperience extends ExperienceBase {
  kind: 'existingLevel';
  levelKey: string;        // real level name, e.g. 'Oceans_FishVTrash_2024'
  levelType: string;       // 'Fish' | 'Music' | 'Multi' | 'Match' | 'External' | 'StandaloneVideo' | 'LevelGroup' | 'BubbleChoice' | 'GamelabJr' | ...
  runtime: 'labhost' | 'generic' | 'unsupported';
  labKey?: 'oceans' | 'music'; // LAB_REGISTRY key when runtime is labhost
  levelNumericId?: number; // synthetic id for the LevelProperties wire shape
  data?: GenericLevelData; // structured payload for generic renderers
}

/** Agent-created executable learner content, sandboxed. */
export interface WidgetExperience extends ExperienceBase {
  kind: 'widget';
  widgetId: string;        // addresses source + descriptor in the widget store
  toolName: string;        // MCP tool name, e.g. 'present_balance_the_data'
  description?: string;
  defaultInput?: Record<string, unknown>;
}

export type Experience =
  | ContentExperience
  | ExistingLevelExperience
  | WidgetExperience;

/** Author-defined constraints the learner-time tutor operates inside. */
export interface AdaptivePolicy {
  tutorGuidance?: string;  // author-written guidance
  alternatives?: Record<string, string[]>; // experienceId -> authored alternates
  allowRepeat?: boolean;
}
```

`GenericLevelData` is a discriminated union carrying the structured content of
simple level types the prototype renders without their Rails renderers:
`{type:'multi'}` (question, answers with correctness, allowMultipleAttempts),
`{type:'match'}` (prompt/answer pairs), `{type:'markdown'}` (External pages),
`{type:'video'}` (video key + resolved YouTube code when available),
`{type:'levelGroup'}` (pages of inlined sub-level data),
`{type:'bubbleChoice'}` (choice names/display names),
`{type:'opaque'}` (unsupported: raw properties for an honest fallback card).

### Runtime mapping for imported level types

| Level type | runtime | rendering |
| --- | --- | --- |
| Fish (Oceans) | labhost | real `@code-dot-org/oceans-lab` via LabHost |
| Music | labhost | real `@code-dot-org/music-lab` via LabHost |
| External | generic | markdown renderer |
| Multi | generic | multiple-choice renderer |
| Match | generic | matching renderer |
| StandaloneVideo | generic | video card (YouTube embed when key resolves) |
| LevelGroup | generic | paged container of inlined sub-levels |
| BubbleChoice | generic | choice chooser; unsupported sublevels fall back |
| GamelabJr, Dancelab, … | unsupported | honest identity card; author may replace or augment with a Widget |

Vibe-coding a Widget replacement for an unsupported type is an explicit,
supported author move — not silent auto-conversion.

## CurriculumChange (contract)

Every mutation — agent tool call or direct author manipulation — appends one
entry. Existing ids stay existing ids; new objects get `draft:` ids. The log
is the inspectable seam where a production Levelbuilder/Rails write adapter
would attach.

```ts
export type CurriculumChange = {seq: number; at: string; actor: 'agent' | 'author'} & (
  | {op: 'createCourse'; course: CourseStub}
  | {op: 'createUnit'; courseId: string; unit: UnitStub; position?: number}
  | {op: 'createLesson'; unitId: string; lesson: LessonStub; position?: number}
  | {op: 'updateUnit'; unitId: string; patch: Partial<UnitStub>}
  | {op: 'updateLesson'; lessonId: string; patch: LessonPatch}
  | {op: 'insertExperience'; lessonId: string; experience: Experience; position: number}
  | {op: 'removeExperience'; lessonId: string; experienceId: string}
  | {op: 'moveExperience'; lessonId: string; experienceId: string; toPosition: number; toLessonId?: string}
  | {op: 'updateContent'; experienceId: string; patch: ContentPatch}
  | {op: 'attachExistingLevel'; lessonId: string; levelKey: string; position: number}
  | {op: 'createWidget'; descriptor: WidgetDescriptor}
  | {op: 'updateWidgetMetadata'; widgetId: string; patch: Partial<WidgetDescriptor>}
);
```

## Widgets and the shared runtime (MCP Apps shape)

Adapted from PR #74649 (`apps/src/aiTutorialDemo/mcp/*` on branch
`ai-tutor-mcp-demo`) into `@code-dot-org/widget-runtime`:

- `WidgetFrame` — `<iframe sandbox="allow-scripts" srcDoc>` (opaque origin, no
  network, no cookies, no parent DOM), JSON-RPC 2.0 over postMessage:
  `ui/initialize` handshake, `ui/notifications/tool-input|tool-result`,
  `ui/update-model-context` (learner events out), `ui/notifications/size-changed`.
- `appShim` — the in-iframe `window.McpApp` client, inlined into every widget
  document; surface mirrors the official `@modelcontextprotocol/ext-apps` App.
- `buildWidgetDocument` — wraps widget markup/css/js with an inline CSP
  (`default-src 'none'`), so generated widgets default to zero network.
- `WidgetHostRuntime` — connects an MCP `Client` to widget servers over
  `InMemoryTransport` (official `@modelcontextprotocol/sdk`), discovers tools
  (`_meta.ui`: `resourceUri`, `visibility: ('model'|'app')[]`), prefetches
  `ui://` resources. `createWidgetServer(descriptor, html)` builds a generic
  in-memory MCP server from an authored `WidgetDescriptor` — a trivial widget
  requires no remote infrastructure, ever.

```ts
export interface WidgetDescriptor {
  id: string;
  toolName: string;
  title: string;
  description: string;      // model-facing
  inputSchema: Record<string, unknown>; // JSON schema
  resourceUri: string;      // ui://widgets/<id>.html
  visibility: ('model' | 'app')[];
  network: 'none';          // offline default, explicit and validated
  eventTypes?: string[];    // structured events the widget emits
}
```

Widget source is plain files under the authoring session
(`widgets/<id>/widget.html` + `meta.json`), written by the embedded coding
agent as normal code, inspectable, hot-reloaded into the mounted frame.

## Execution modes

- OFFLINE / ONLINE-WITHOUT-AI: deterministic authored sequence. Next/previous
  through `lesson.experiences`. No model call anywhere on this path.
- ONLINE-WITH-TUTOR: opt-in. The tutor may select or configure an
  already-authored Experience (constrained to the lesson's experiences and
  `adaptivePolicy.alternatives`), offer hints, and react to widget events. It
  may not create code, modify curriculum, or touch sandbox policy. It drives
  the same Experience renderer the deterministic path uses.

Publish output includes an offline-compatibility report per lesson: content
present, widget assets local (`network: 'none'`), deterministic next step
exists, lab assets local; video embeds are flagged as external.

## Embedded authoring agent

`@anthropic-ai/claude-agent-sdk` inside the authoring service. The agent gets:

- a `curriculum` in-process MCP server exposing the semantic ops
  (create_course, create_unit, create_lesson, update_lesson, update_content,
  insert_experience, move_experience, remove_experience, attach_existing_level
  — with a search over the imported level catalog — create_widget,
  update_widget_metadata, set_adaptive_policy);
- file tools (Read/Write/Edit) confined by a permission callback to the
  session's `widgets/` directory for widget source;
- no Bash, no access to Studio/labs/platform code.

Whole-course authoring is outline-first: the system prompt directs the agent
to produce course → units → lesson outlines (goal, duration, sequence,
outcome) quickly, then realize individual lessons into experiences only when
asked ("Build this lesson"). Structural progress streams to Studio over SSE as
each op lands.

Draft state is file-backed under `frontend/.authoring/sessions/<id>/`
(gitignored): `curriculum.json`, `changes.jsonl`, `chat.jsonl`, `widgets/`.
Survives browser refresh and service restart.

## Author Mode UX

One component tree. Author affordances are a UX layer gated by
`currentUser.isLevelbuilder || admin` (dev override in the prototype);
toggling Student view removes the affordances and what remains IS the learner
experience. Layout: learner experience on the left, AI author sidebar on the
right; outline rail, insertion points between experiences, reorder/remove,
scope-aware chat (course / unit / lesson / experience).
