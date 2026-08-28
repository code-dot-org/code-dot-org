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

Studio runs standalone (`yarn dev`, port 3036 — no `VITE_API_MODE=msw`
required on staging's host contract). The authoring service is a separate
local Node process (port 3737); Studio reaches it through a Vite dev proxy at
`/authoring-api`. Real labs mount through staging's `<Lab levelId
levelPropertiesMap>` (`@code-dot-org/lab/host`), the same host contract the
live `/courses/.../levels/$levelPosition` route uses: level properties are
fetched from `/authoring-api/levels/:id/level_properties` through the
`modules/authoring` react-query layer and passed straight into `<Lab>` as a
prop — no MSW fixture, no synthetic-id floor. `ExperienceStage` dispatches to
a lab entrypoint by `appName` (`getLabEntrypointByAppName`, keyed off the
fetched properties), not by the domain model's `labKey`. Only `fish` (Oceans)
has a registered entrypoint on staging; `music` has none, so Music levels
fall to `UnsupportedLevel` — see the runtime mapping table below.

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
shape `<Lab>` consumes. The level `name` remains the real identity.

## Domain model (contract)

Lives in `@code-dot-org/authoring` (`src/model/types.ts`). Deliberately small.

```ts
export type Origin = 'levelbuilder' | 'draft';
// Draft ids are `draft:<uuid>`; imported ids embed the real Levelbuilder keys.

export interface CourseModel {
  id: string; // course name, e.g. 'k5-ai-data-2024', or draft:<uuid>
  offeringKey?: string; // course_offerings key, e.g. 'k5-ai-data'
  displayName: string;
  gradeLevels?: string;
  origin: Origin;
  units: Unit[];
}

export interface Unit {
  id: string; // script name, e.g. 'k5-ai-data-2024', or draft:<uuid>
  displayName: string;
  origin: Origin;
  overview?: string; // markdown
  lessons: Lesson[];
}

export interface Lesson {
  id: string; // `lb:<script>:<lessonKey>` or draft:<uuid>
  lessonKey?: string; // real Levelbuilder lesson.key when imported
  displayName: string;
  origin: Origin;
  goal?: string; // pedagogical intent (outline-first authoring)
  durationMinutes?: number;
  overview?: string; // learner-facing markdown (student_overview)
  outline?: string[]; // planned high-level sequence, pre-realization
  expectedOutcome?: string;
  experiences: Experience[];
  adaptivePolicy?: AdaptivePolicy;
}

interface ExperienceBase {
  id: string; // `lb:<levelKey>` or draft:<uuid>
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
  levelKey: string; // real level name, e.g. 'Oceans_FishVTrash_2024'
  levelType: string; // 'Fish' | 'Music' | 'Multi' | 'Match' | 'External' | 'StandaloneVideo' | 'LevelGroup' | 'BubbleChoice' | 'GamelabJr' | ...
  runtime: 'labhost' | 'generic' | 'unsupported';
  labKey?: 'oceans' | 'music'; // LAB_REGISTRY key when runtime is labhost
  levelNumericId?: number; // synthetic id for the LevelProperties wire shape
  data?: GenericLevelData; // structured payload for generic renderers
}

/** Agent-created executable learner content, sandboxed. */
export interface WidgetExperience extends ExperienceBase {
  kind: 'widget';
  widgetId: string; // addresses source + descriptor in the widget store
  toolName: string; // MCP tool name, e.g. 'present_balance_the_data'
  description?: string;
  defaultInput?: Record<string, unknown>;
  // Set once this widget graduates through the PR flow (see "Graduating a
  // widget" below). widgetId is unchanged and still resolves the session
  // draft, which is the fallback GET /api/widgets/:id serves if the
  // catalog copy is ever unresolvable.
  catalogRef?: {slug: string; version: string};
}

export type Experience =
  | ContentExperience
  | ExistingLevelExperience
  | WidgetExperience;

/** Author-defined constraints the learner-time tutor operates inside. */
export interface AdaptivePolicy {
  tutorGuidance?: string; // author-written guidance
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

| Level type             | runtime     | rendering                                                                                                                                                                                                                                 |
| ---------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fish (Oceans)          | labhost     | real `@code-dot-org/oceans-lab` via `<Lab>`, `appName: 'fish'`                                                                                                                                                                            |
| Music                  | labhost     | domain model says labhost, but staging has no `music` lab entrypoint registered — falls to `UnsupportedLevel`                                                                                                                             |
| Maze                   | labhost     | real `@code-dot-org/maze-lab` via `<Lab>`, `appName: 'maze'` — both imported and AI-authored (`create_level`) levels; Karel-family skins (Bee/Farmer/Harvester/Collector) stay unsupported (see "AI level authoring: Maze puzzles" below) |
| External               | generic     | markdown renderer                                                                                                                                                                                                                         |
| Multi                  | generic     | multiple-choice renderer                                                                                                                                                                                                                  |
| Match                  | generic     | matching renderer                                                                                                                                                                                                                         |
| StandaloneVideo        | generic     | video card (YouTube embed when key resolves)                                                                                                                                                                                              |
| LevelGroup             | generic     | paged container of inlined sub-levels                                                                                                                                                                                                     |
| BubbleChoice           | generic     | choice chooser; unsupported sublevels fall back                                                                                                                                                                                           |
| GamelabJr, Dancelab, … | unsupported | honest identity card; author may replace or augment with a Widget                                                                                                                                                                         |

Vibe-coding a Widget replacement for an unsupported type is an explicit,
supported author move — not silent auto-conversion.

## CurriculumChange (contract)

Every mutation — agent tool call or direct author manipulation — appends one
entry. Existing ids stay existing ids; new objects get `draft:` ids. The log
is the inspectable seam where a production Levelbuilder/Rails write adapter
would attach.

```ts
export type CurriculumChange = {
  seq: number;
  at: string;
  actor: 'agent' | 'author';
} & (
  | {op: 'createCourse'; course: CourseStub}
  | {op: 'createUnit'; courseId: string; unit: UnitStub; position?: number}
  | {op: 'createLesson'; unitId: string; lesson: LessonStub; position?: number}
  | {op: 'updateUnit'; unitId: string; patch: Partial<UnitStub>}
  | {op: 'updateLesson'; lessonId: string; patch: LessonPatch}
  | {
      op: 'insertExperience';
      lessonId: string;
      experience: Experience;
      position: number;
    }
  | {op: 'removeExperience'; lessonId: string; experienceId: string}
  | {
      op: 'moveExperience';
      lessonId: string;
      experienceId: string;
      toPosition: number;
      toLessonId?: string;
    }
  | {op: 'updateContent'; experienceId: string; patch: ContentPatch}
  | {
      op: 'attachExistingLevel';
      lessonId: string;
      levelKey: string;
      position: number;
    }
  | {op: 'createWidget'; descriptor: WidgetDescriptor}
  | {
      op: 'updateWidgetMetadata';
      widgetId: string;
      patch: Partial<WidgetDescriptor>;
    }
  | {
      op: 'adoptCatalogWidget';
      experienceId: string;
      catalogRef: {slug: string; version: string} | null; // null detaches
    }
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
  description: string; // model-facing
  inputSchema: Record<string, unknown>; // JSON schema
  resourceUri: string; // ui://widgets/<id>.html
  visibility: ('model' | 'app')[];
  network: 'none'; // offline default, explicit and validated
  eventTypes?: string[]; // structured events the widget emits
}
```

Widget source is plain files under the authoring session
(`widgets/<id>/widget.html` + `meta.json`), written by the embedded coding
agent as normal code, inspectable, hot-reloaded into the mounted frame.

### Graduating a widget: the catalog and catalogRef

A session widget lives only in the gitignored `.authoring/` store. The
"Propose for catalog" affordance (widget properties panel) graduates one
into `frontend/packages/widgets-catalog/widgets/<slug>/` through a real pull
request: `POST /api/widgets/:id/propose` pre-flights the contract gates,
mints a slug from `toolName`, copies `src/` verbatim, writes `widget.json` /
`CHANGELOG.md` / `PROVENANCE.md`, and commits onto a branch — `mode: 'dry-run'`
stops there, `mode: 'push'` additionally pushes to a configured remote and
returns a GitHub compare URL. The endpoint never opens a pull request; a
human does that from the returned URL.

`GET /api/widgets/propose-config` reports whether a push remote is
configured (`AUTHORING_PROPOSE_REMOTE`) — the studio dialog disables the
push step and explains why when it isn't, rather than the client or the
service guessing a default.

Once a widget merges, `catalogRef` on the referencing `WidgetExperience`
(`adoptCatalogWidget`, above) points a lesson at the reviewed build instead
of the session draft: `GET /api/widgets/:id` resolves catalog-first (does
any experience referencing this `widgetId` carry a `catalogRef`? build it
on demand through the same `buildWidget` the session's own widgets use, via
`@code-dot-org/widgets-catalog`'s `computeWidgetArtifact`), falling back to
the session store — with `servedFrom: 'catalog' | 'session'` and, on a
failed catalog resolution (a stale version, a missing slug), `catalogFallback:
true` in the response, so the UI can show what actually happened rather than
a silent, identical-looking fallback. `adoptCatalogWidget`'s `catalogRef:
null` detaches back to the draft; both directions go through the normal
`CurriculumChange` apply path, so they are Undo/Redo-able like any other
edit.

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
  update_widget_metadata, create_level, update_level, set_adaptive_policy);
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

## AI level authoring: Maze puzzles

`create_level`/`update_level` let the agent build a new Maze-type level
directly, rather than only attaching an existing one. The agent describes a
puzzle as a plain-JSON grid (`0`=wall, `1`=open, `2`=start, `3`=finish,
`4`=obstacle, `5`=combined start/finish — the same encoding
`Subtype.initStartFinish`/`tiles.SquareType` use) plus a typed block program
(`moveForward` / `turnLeft` / `turnRight` / `repeat`) — never hand-written
Blockly XML. Restricted to those four block kinds because that is what the
plain "birds" skin's toolbox can safely offer: `maze_if`/`maze_ifElse`/
`maze_untilBlockedOrNotClear`'s `isPathForward`/`isPathLeft`/`isPathRight`
predicates are wired into `blocks.ts`'s code generator but never implemented
in `packages/labs/maze/src/api.ts` on this ported branch — the same class of
gap that left Karel unsupported — so including them would let a level mount
a toolbox block that throws the instant a learner runs it.

**The solvability gate.** Before a `create_level`/`update_level` call is
accepted, `apps/authoring-service/src/levels/mazeLevel.ts` proves the
declared solution actually reaches the goal: a pure TypeScript simulation of
`move`/`turn`/`isPath`/`checkSuccess` (`packages/labs/maze/src/{api,
Validator,Subtype}.ts`), plus a BFS reachability check independent of the
given solution, a toolbox-coverage check (the solution may only use block
kinds the level's own toolbox lists), and a block-count budget
(`idealBlockCount` + a small tolerance). The ported engine itself
(`Maze.ts`/`MazeController.reset()`) is unconditionally bound to a Blockly
`Workspace` and an `SVGSVGElement` (`document`/`window.setTimeout`
throughout) — not headlessly drivable without a full jsdom+Blockly rig — so
simulation, not the real engine, is what runs the gate; the two were verified
to agree by hand-tracing real `.level` files under
`dashboard/config/levels/custom/maze/`. A rejection returns as a normal
correctable MCP tool error naming the specific problem (wall hit at a
row/col, block type missing from the toolbox, budget exceeded, or an
unreachable goal) — nothing is created or changed until the gate passes.

On success the level's LevelProperties are registered under a synthetic
numeric id in the exact wire shape `buildMazeLevelProperties` builds for a
real imported Maze level (`maze` grid JSON, `skin`, `startDirection`,
`startBlocksXml`/`toolboxBlocksXml`/`solutionBlocksXml` — the same legacy
Blockly XML dialect real `.level` files use, generated server-side), so a
draft level mounts through the exact same `<Lab>` path an imported Fish/Music
level does — no studio changes. The typed definition (grid, block program,
toolbox, instructions) is also written to
`frontend/.authoring/sessions/<id>/levels/<levelId>/level.json`, mirroring
`widgets/<id>/meta.json`, so `update_level` can read-merge-reverify-write it.

Production write path (not implemented here): a real Rails adapter would
serialize the same grid/block-program fields into a `PATCH /levels/:id`
call with `level[<property>]` form fields — the shape
`apps/src/levelbuilder/lesson-generator/levelApi.ts`'s `updateLevelProperty`
already uses, against `Level.permitted_params`'s `serialized_attrs`
allow-list.

## Author Mode UX

One component tree. Author affordances are a UX layer gated by
`currentUser.isLevelbuilder || admin` (dev override in the prototype);
toggling Student view removes the affordances and what remains IS the learner
experience. Layout: learner experience on the left, AI author sidebar on the
right; outline rail, insertion points between experiences, reorder/remove,
scope-aware chat (course / unit / lesson / experience).
