# AI Lessons (hackathon prototype)

A small end-to-end surface mounted at `/ai_lessons` that demonstrates
AI-authored, AI-tutored, AI-evaluated lessons running on top of the
existing Lab2 surfaces (Web Lab 2, Music Lab, and Panels) without going
through the Level / Lesson / Script ActiveRecord pipeline.

Code lives under:

- `apps/src/aiLessons/` — the React surface (this directory)
- `apps/src/sites/studio/pages/ai_lessons/` — webpack entry shims
- `dashboard/app/controllers/ai_lessons_controller.rb` — Rails controller
- `dashboard/app/views/ai_lessons/*.html.haml` — view shells + locale loader
- `dashboard/config/ai_lessons/` — repo-shipped exemplar lessons (read-only
  through the UI; edit the JSON directly)
- `dashboard/tmp/ai_lessons/` — on-disk storage (lessons, sources, images,
  progress)

The surface is wired so that none of it depends on production Level
infrastructure; it can be deleted in a single commit without leaving
schema or seed scars.

## Goals (the motivations behind the prototype)

1. **Streamline instructional content on the page.** Instead of dumping
   a list of four "Do this" bullet points and a wall of explanation onto
   the student, break the work into discrete, single-target checkpoints.
   Each checkpoint has one objective; the AI Tutor synthesises the
   instructions on the fly and the student sees one focused message at a
   time.

2. **One voice, one judge.** The AI Tutor is the only entity that talks
   to the student. It writes the per-checkpoint instructions, evaluates
   the work, and decides when to advance. There are no separate
   validation conditions, server-side validators, or unit-test-like
   completion checks. The model gets the lesson plan, the student's
   live source, and a structured success criterion; it returns
   `{message, action ∈ stay|advance|celebrate}` via a constrained
   `Output.object` schema, and the surface obeys.

3. **Eschew the existing Level/Lesson/Script models.** Lessons are
   plain JSON files on disk under `dashboard/tmp/ai_lessons/`. There is
   no DB migration, no seed file, no `Level` row, no `Lesson` row, no
   `Script` row. The trade-off is that this prototype can't be shared
   with the wider curriculum surface, but the iteration speed is much
   higher and the blast radius is zero.

4. **Explore AI-generated lesson content.** The curriculum author types
   one paragraph ("create a 5-checkpoint lesson on loops using Music
   Lab and Web Lab 2 for grade 6") and the AI fills in everything —
   title, objective, ordered checkpoints, lab type assignments,
   success criteria, panel slide captions, and panel illustrations.
   The author can edit any of it inline before saving.

## Lesson format v2: steps

A lesson is an ordered list of typed **steps** (`types.ts`), replacing the
v1 model where every entry was a lab checkpoint.  Old v1 JSONs still load
— `normalizeLessonPlan()` in `lessonFormat.ts` migrates `checkpoints` to
steps at read time.

Step kinds:

- **lab** — the student works in Web Lab 2 or Music Lab.  `validation:
  'tutor'` gates advancement on the AI Tutor's judgment against
  `successCriteria`; `validation: 'none'` shows a Continue button
  (explore / free-play steps — the tutor chats but never gates).
- **panels** — the instructional slide carousel; Continue advances.
- **questions** — free-response / multiple-choice / scale prompts,
  one at a time.  Every answer is recorded as student input.
- **hub** — a skill-tree hub: several `paths` (ordered runs of ordinary
  lesson steps, each with a `title`, an `objective`, and optionally an
  official `standard` key) visible at once with per-path progress; the
  student picks which to continue.  Entering a path is navigation, not
  completion; finishing a path's last step returns to the hub.  A path
  with `requires: [pathIds]` stays locked until those complete (the
  expanding tree).  The hub's own `next` fires once every required path
  is complete — which is how a lesson strings hub sections together.
  Path membership is read through `pathStepsFor()`, the seam where a
  per-student overlay (the future mastery agent appending remediation
  steps) slots in.  Completion is tracked as `completedStepIds` on the
  progress snapshot.

  Teachers see the same picture: the roll-up carries each lesson's hub
  definitions plus the student's completion set, rendered with the same
  `ProgressRing` component the student hub uses; and the AI progress
  summary describes hub lessons per path — named skills, objectives,
  standards — instead of step numbers.

  Completing a path's last step also triggers a background **mastery
  evaluation** (`mastery.ts`): an LLM judges the path's recorded
  evidence — answers, AI prompts and their kept/undone outcomes, rubric
  observations, final work — against the path's objective and standard,
  producing `{mastered, reasoning, gaps}` on the progress snapshot.
  One verdict per path; never blocks navigation.  Teachers see a
  "★ mastered" / "△ needs more" badge on the path chip with the
  reasoning and gaps on hover.  The `gaps` list is sized for the next
  phase: a remediation generator appending steps to the path through a
  per-student overlay.

  A failed verdict closes the loop: `generateRemediationSteps`
  (Gemini Pro — off the critical path, content quality matters) writes
  1-2 targeted sandbox exercises from the verdict's gaps, personalized
  with the student's own interview answers and forbidden from repeating
  the path's existing exercises.  They land in the overlay (overlay
  write BEFORE the verdict write, so a crash between them leaves an
  extra exercise without a verdict rather than the reverse), the path's
  ring grows a segment in place, and the hub gate reopens.  Completing
  the added practice re-completes the path, which re-evaluates —
  mastered verdicts are final; failed ones regenerate up to
  MAX_REMEDIATION_ROUNDS (2), after which the honest verdict stands.
  The tutor is briefed to frame added steps as growth ("a new challenge
  because you're close"), never as failure, and never to mention
  judging; teachers see "+N added" beside the mastery badge.

  The **overlay** (`overlay.ts`) is that landing pad: a per-(lesson,
  user) file (`overlays/<lessonId>/<userId>.json`, GET/PUT at
  `/ai_lessons/:id/overlay`) holding generated step definitions, the
  path ids they extend, and the remediation rounds consumed.  The
  authored lesson is shared and immutable; `applyOverlay()` merges the
  two into the effective lesson the player runs — generated steps are
  appended to the end of the array (array position drives
  checkpointIndex, so mid-array insertion would corrupt event history)
  and routed by path membership.  Defensive on generated content:
  colliding ids and dangling extensions are dropped, and the merged
  plan re-normalizes so malformed steps degrade like malformed authored
  JSON.  The teacher roll-up merges the same extensions so ring totals
  match the student's.

Cross-cutting fields:

- `role` + `segment` — advisory labels ("skill practice: HTML tags",
  "project checkpoint") for grouping; never drive behavior.
- `next` / `option.goTo` — branching pointers: the array is the default
  order, `goTo` jumps, `next` rejoins (or `'end'` finishes).
- `branches` — automatic performance branching on any step: a list of
  `{when, goTo}` conditions the resolver evaluates when the step
  completes.  Conditions: `score` (count of first-attempt-correct
  answers on a graded questions step) or `aiJudge` (an LLM passes or
  fails the student's recorded inputs for a step against prose
  criteria).  First match wins; no match falls through to
  `next`/array order — so the fallthrough path is the default branch.
  This encodes the branch-point authoring template: a shared objective,
  a core exercise carrying `branches`, one step per branch, each branch
  step's `next` pointing at the rejoin step.
- `sourceMode: 'sandbox'` — isolates a skill-practice step's source from
  the student's project (scoped to the segment).
- `starterPrompt` / `starterFiles` — generated-per-student or literal
  starting code.
- `aiPrompting` / `presetPrompts` — whether the student can prompt the AI
  build partner to write code into this step's source.
- `promptPrefill` — seeds the build partner's free-form prompt box with
  a working prompt the student can fire or tweak (their first taste of
  prompting; personalization comes from recorded answers regardless).
- `readOnly` — the lab mounts frozen (look, don't touch): showcase
  steps where the AI generates something aspirational to react to.
- `levelProperties` — a slice of the target lab's own LevelProperties
  schema, merged into the levelProperties EmbeddedLab synthesizes at
  mount.  Today's use: weblab2's `initialViewMode: 'split' | 'code' |
  'preview'` (prompt-driven steps open on the rendered page;
  code-reading steps open split).  Identity/project fields the player
  owns can't be overridden.  The arc and remediation generators emit it
  too — labLevelProperties.ts owns the per-lab schema fields and the
  allowlist coercion both generators compose in.
- Lesson-level `checklist` — project rubric the tutor reports against.

### Adaptivity: one lesson, a slider of experiences

A lesson JSON can back three run modes, resolved per student as
`min(authored adaptivity.max, ?adaptivity= override ?? authored
default)` (`resolveAdaptivity` in `types.ts`; absent field =
augment/augment, so old lessons never change):

- **static** — the authored steps verbatim.  No mastery machinery at
  all: no evaluation, no generation, no AI beyond the tutor itself.
- **augment** — the default.  Authored progression as written; the
  mastery agent may extend hub paths with remediation.
- **full** — completing `arcSpec.generateAfter` triggers the **arc
  generator** (`arcGenerator.ts`, Gemini Pro): one call designs the
  rest of the lesson for this student — hubs, paths, exercises — from
  the `arcSpec` curriculum contract (standards by id, example
  projects, prose guidance) and the student's diagnostics.  The
  authored span between `generateAfter` and `rejoinAt` is handed to
  the model as its exemplar and quality bar, and stays untouched as
  the fallback: generation failure means the authored lesson simply
  plays.  The arc lands in the overlay (spliced in via a
  `nextOverrides` rewrite of the boundary step), so it's reload-safe,
  reset-wipeable, teacher-visible, and every downstream system —
  rings, navigation, tutor, mastery evaluation, remediation inside
  the generated hubs — runs on it without knowing it was generated.
  A ⟳ header affordance (demo) regenerates the arc from the same
  diagnostics.

Generated arcs are treated as hostile until coerced: ids sanitized
and `arc-` namespaced, references remapped, standards restricted to
the contract list, dangling path steps and empty hubs dropped, and
routing forced to terminate at `rejoinAt`/'end'.

### Navigation

Where to go after a step completes is decided by a **navigation
resolver** (`navigation.ts`), never by the page.  The deterministic
resolver's precedence: the student's branch option, then automatic
`branches`, then skill-path continuation (next incomplete step in the
owning hub's path, else the hub itself), then the step's `next`
pointer, then array order, then end.  Entering a hub path and the
"back to hub" affordance are plain navigation — nothing records until
a step completes.  The interface is async
and context-fed so an adaptive resolver (suggest the next step from the
student's answers, performance, and chat) can replace it without touching
call sites; a `recommend()` seam for "highlight one option in a hub"
exists but returns nothing until student inputs land.

The split of responsibilities: **the tutor judges, the resolver routes.**
The tutor's `advance`/`celebrate` verdict only unlocks the Continue
button; every navigation goes through the resolver.  Position is a
step-id path persisted in the progress snapshot, so branched
playthroughs resume exactly where they left off (old index-only
snapshots fall back to last-completed + 1).

The resolver's `recommend()` also picks which branch option to badge as
"✨ Suggested" — authored `recommendWhen` rules on a question option,
matched against the student's recorded answers (chosen options, graded
outcomes, attempt counts, scale bounds; conditions AND within a rule,
rules OR across the list, first matching option in authored order
wins).  Purely advisory — every option stays clickable.  Both exemplar
hubs carry rules: the musical-artist check-in suggests more HTML/CSS
practice from quiz outcomes, the fan-page hub suggests a mini lesson
from the experience slider and AI rating.  An AI-backed resolver can
later replace the rule matching without any UI change.

`aiJudge` branch conditions are evaluated by an LLM judge
(`branchJudge.ts`): it reads the student's recorded inputs for the
named step and passes or fails them against the authored criteria,
strictly ("when in doubt, false").  Navigation stays free of LLM
dependencies — StudentPage injects the judge via
`NavContext.judgeCondition`, and Continue shows "Deciding what's
next…" while a judged resolution is in flight.  No recorded inputs
means no LLM call; a judge failure means no match — both fall through
to the default path.

### Questions and student inputs

Questions steps render through `QuestionFlow.tsx`: one question at a
time — free response, multiple choice (single or check-all), or a slider
scale.  Key-validated questions gate on the correct option with retries;
branch options complete the step through the resolver; hub options show
a check mark once their target has been visited.

Every answer, graded or not, is recorded as an `AnswerRecord`
(`studentInputs.ts`) in a per-(lesson, user) map at
`dashboard/tmp/ai_lessons/inputs/<lessonId>/<userId>.json`.  Records
denormalize the question prompt and carry outcome + attempt counts, so
they're self-describing for every consumer: QuestionFlow prefill, the
tutor's STUDENT CONTEXT prompt section (personalization — the tutor
knows the student's project, interests, and confidence), and later the
starter-code generator and adaptive resolver.

**Runtime support is intentionally behind the format** (walking-skeleton
rule: every step kind renders, unsupported mechanics degrade politely):

### The AI build partner and student sources

`buildPartner.ts` turns a prompt into a complete Web Lab 2 project
(whole files via structured output, personalised with the student's
recorded answers).  One code path, two triggers:

- **Starter generation**: a lab step's authored `starterPrompt` runs
  once per student on first arrival — the interview answers become
  *their* starter site.  The result is persisted through our sources
  API, then the lab mounts on it like any saved source.  Authored
  `starterFiles` (e.g. a sandbox with planted bugs) win over generation.
- **Student prompting**: steps with `aiPrompting: 'presets' | 'free'`
  show BuildPartnerPanel in the tutor sidebar.  A build saves the new
  source and remounts the lab on it (an epoch in the EmbeddedLab key);
  Undo restores the stashed pre-build source the same way.  Every
  student prompt is recorded to the inputs store.

Deliberately, none of this touches lab2's AI-version redux state
(`setAiTutorVersionFiles` et al.) — that machinery is coupled to real
channels, `/project_commits`, and the aichat pipeline.  The trade: no
in-editor per-file diff affordances, and a build/undo resets editor UI
state (open file, cursor) via the remount.

Sources are per-user and per-**scope**: the lab type for the shared
lesson project, or `sandbox-<segmentOrStepId>` for `sourceMode:
'sandbox'` steps, so skill practice never dirties the student's project
and a multi-step segment shares one throwaway workspace.

### Project checklist

A lesson-level `checklist` renders as an always-visible panel in the
tutor sidebar on project-mode lab steps (`stepShowsChecklist`: lab
kind, not sandboxed — skill practice and questions surfaces skip it).
The tutor's system prompt carries the items with their current state
and standing orders; every work evaluation returns per-item verdicts
through the structured output, which check items off live.  Verdicts
persist in the progress snapshot (riding every progress event), and
the teacher roll-up shows "checklist n/m" per lesson.  Read-only for
the student — the tutor is the only thing that checks a box.

### Observations

Beyond answers, the system records HOW students work:

- **Build resolutions**: every build-partner prompt's AnswerRecord
  carries the files it changed and is re-recorded as 'kept' or 'undone'
  when the student resolves it.  The tutor's context shows these
  ("AI build undone"), and a build on a checklist step triggers an
  immediate tutor evaluation of the generated files — no waiting for
  the lab remount.
- **Tutor-judged free responses**: `validation: 'tutor'` questions now
  gate like key-validated ones, with `judgeFreeResponse` (an LLM call
  against the authored success criteria) as the key and its feedback as
  the retry hint.  A judge failure accepts rather than stranding the
  student.
- **Step rubrics**: a lab step with an authored `rubric` gets a process
  observation on completion — one LLM call over the step's prompts,
  graded answers, and final work, producing a teacher-facing summary
  plus a 0-4 effectiveness score.  Stored on the progress snapshot
  (`saveSnapshotExtras` — no event, no summary regeneration), shown in
  the teacher roll-up, and fed to the tutor's OBSERVATIONS context.
  The fix-it sidequest carries the exemplar rubric.

**Runtime support still behind the format:**

- `starterPrompt` / `aiPrompting` are Web Lab 2 only; Music steps
  ignore them.

Two hand-authored exemplar lessons live in `dashboard/config/ai_lessons/`
and are the fixtures development validates against:

- `musical-artist-webpage.json` — project-based HTML/CSS lesson with
  skill-practice segments, project checkpoints, and a branching check-in.
- `adaptive-fan-page.json` — AI-partnership lesson (9-12) with a
  diagnostic, student prompting, a hub of mini lessons, a debugging
  sidequest, and a project checklist.

They're validated (JSON shape, unique ids, resolvable branch targets) by
`apps/test/unit/aiLessons/lessonFormatTest.ts`.

## Current functionality

### Authoring (`/ai_lessons/new`, `/ai_lessons/:id/edit`)

- Single-textarea prompt → `generateLessonFromPrompt` calls Gemini 2.5
  Pro through the AI Gateway with a zod-constrained schema and returns
  a full LessonPlan in one shot.
- Lab capability context is injected into the generator prompt so the
  model can only reference blocks/APIs that the real labs actually
  support. See `labCapabilities.ts` — music block list is derived from
  the live `toolboxBlocks` + SIMPLE2 mode map; Web Lab 2 CSP allowlists
  come from `sharedConstants.ts`.
- After generation, the lesson is auto-saved (so we have an id), then
  panel illustrations are generated in parallel via the Gemini image
  model (`panelImageGenerator.ts`) and uploaded to
  `dashboard/tmp/ai_lessons/images/<id>/`.
- Editor is a single-card carousel: one checkpoint at a time, prev/next
  navigation, with a sub-carousel for slides inside panels checkpoints.
- Per-section tooltips explain Title / Description / Success criteria.
- DSCO `SimpleDropdown` for the lab type picker; design-system color
  tokens for the editor styling.

### Student player (`/ai_lessons/:id`)

- Persistent AI Tutor chat on the left, the real Lab2 React view
  embedded on the right (no iframes). `EmbeddedLab.tsx` mounts the lab
  views directly with synthesised `levelProperties` and an injected
  custom `ProjectManager` so saves persist.
- One-checkpoint-at-a-time. Auto-resumes one past the last completed
  checkpoint on reopen.
- Source carry-over: all non-sandbox lab steps in a lesson that target
  the same lab type share a single project. Editing weblab2 in step 2
  and then returning in step 5 picks up exactly where you left off.
  Sources are per-user, at
  `dashboard/tmp/ai_lessons/sources/<lessonId>/<userId>/<scope>.json`.
- Music's Blockly workspace JSON (not the executed playback events) is
  what the tutor sees when evaluating, so success criteria like "use a
  Repeat block" actually work.
- "Check my work" button + auto-check on lab Run/Play. The tutor
  receives the live source snapshot and returns `stay` (with feedback)
  or `advance` (which navigates to the next checkpoint).
- Demo step navigation lives in the Controls dialog (gear in the
  header) and bypasses tutor approval for presentations.
- AI log dialog (terminal icon next to the gear): every LLM call the
  page makes, tagged by agent, grouped by step-arrival markers, with
  status (in progress / success / failed) and expandable request +
  response.  `aiLog.ts` keeps the in-memory store; the same tap feeds
  the browser-console groups.
- Tutor turns are structured via `Output.object` + zod; the model
  cannot emit free-form prose that confuses the navigation logic.

### Progress + teacher view

- Every Run and every checkpoint completion appends to a per-(lesson,
  user) JSON file at
  `dashboard/tmp/ai_lessons/progress/<lessonId>/<userId>.json` and
  refreshes a 2-3 sentence LLM-generated teacher summary
  (`studentProgress.ts`).
- `/ai_lessons/progress` is a read-only roll-up grouped by student.
  Each student card lists the lessons they've touched, their position
  in each, and the latest summary. Sorted most-recently-active first.

### Routes (Rails)

Every in-app page path serves the same SPA shell (`AiLessonsController#app`).
The client-side router in `AiLessonsApp.tsx` decides which page to
render; data is fetched lazily via the JSON endpoints below.

```
# page paths — all render the same SPA shell:
GET    /ai_lessons                                # index
GET    /ai_lessons/progress                       # teacher progress (before /:id)
GET    /ai_lessons/new                            # author a new lesson
GET    /ai_lessons/:id                            # student player
GET    /ai_lessons/:id/edit                       # edit lesson

# JSON endpoints — used by the SPA after it mounts:
GET    /ai_lessons/data/lessons                   # list of lessons (index page)
GET    /ai_lessons/data/progress                  # teacher progress roll-up
GET    /ai_lessons/:id.json                       # full LessonPlan JSON

# CRUD:
POST   /ai_lessons                                # create
PUT    /ai_lessons/:id                            # update
DELETE /ai_lessons/:id                            # destroy (also wipes images, sources, progress)

# sub-resources:
POST   /ai_lessons/:id/images                     # upload generated image
GET    /ai_lessons/:id/images/:filename           # serve generated image (auth skipped)
GET    /ai_lessons/:id/sources/:lab_type          # load saved source
PUT    /ai_lessons/:id/sources/:lab_type          # save source
GET    /ai_lessons/:id/progress                   # this user's progress
PUT    /ai_lessons/:id/progress                   # write this user's progress
GET    /ai_lessons/:id/inputs                     # this user's question answers
PUT    /ai_lessons/:id/inputs                     # write this user's answers
```

## Future ideas (where this could go)

1. **Fully adaptive progression.** Checkpoints are created on the fly
   based on how the student has been doing in earlier ones. The
   curriculum author specifies the learning objective and a few
   "tentpoles" (a sample project, key concepts to cover) and the AI
   fills in the intermediate checkpoints as the student moves through
   the lesson. The tutor would have an extra capability — generate the
   next checkpoint — alongside its current evaluation role.

2. **Fall back to fully static.** Levelbuilders can still author every
   checkpoint in detail so a lesson can run end-to-end as a deterministic
   experience, no AI in the loop at runtime. The same data model
   (checkpoints, success criteria) supports both — the difference is
   whether the AI is allowed to write/edit/judge or whether it stays
   out of the way.

3. **Mode toggle (static ↔ guided ↔ adaptive).** Either the levelbuilder
   or the teacher picks the experience for a given class. Same lesson
   plan, three different runtime modes:
   - *Static*: instructions and pass/fail are pre-authored, no LLM at
     runtime.
   - *Guided* (current prototype): authoring is AI-assisted, runtime is
     AI-tutored, but the checkpoint structure is fixed at save time.
   - *Adaptive*: checkpoints are generated on the fly within the
     tentpoles.

4. **Folding into the broader curriculum model.** What does the AI
   Lesson concept look like inside a unit or course? Should AI Lessons
   become a flavour of `Lesson`, or a separate model that participates
   in `Unit`/`Script` membership some other way? When a lesson sits
   inside a bigger grouping, how do we feed unit-level context (prior
   concepts, vocabulary, programming environment chosen for the unit)
   to the generator and the tutor? Open questions; out of scope for
   the prototype.

## Parking lot / caveats / known limits

### Cleanup wanted

- **Lab integration is messy.** `EmbeddedLab.tsx` is the seam between
  AI Lessons and Lab2. It synthesises `levelProperties`, injects a
  custom `ProjectManager` into `Lab2Registry`, wraps in `DialogManager`,
  passes `hideResourcePanel` (an `ExtraLabProps` field defined in
  `lab2/types.ts`) down to the lab view, and threads
  `lessonId`/`labType` through everywhere. `MusicLabView` and
  `InfoPanel` (weblab2) read the `hideResourcePanel` prop and drop the
  ResourcePanel column when it's true. Worth reviewing whether the
  abstraction belongs in lab2 itself or whether there's a cleaner
  extension point.
- **Big files.** `AuthorPage.tsx`, `StudentPage.tsx`, and `EmbeddedLab.tsx`
  are all north of 400 LOC. Break out smaller components: the carousel,
  the lab-mount setup hook, the panels carousel, the chat composer.
- **Fix weblab2 resizing.** The Web Lab 2 view doesn't always re-measure
  its inner panels when its container changes size — switching
  checkpoints or resizing the window can leave the editor or preview
  pinned to a stale width.
- **Starter authoring UI.** Starter code exists in the format
  (`starterFiles` for literal files, `starterPrompt` for generation,
  `sourceMode: 'sandbox'` for a clean slate) and the runtime honours
  all three, but only via hand-edited JSON — the editor doesn't expose
  them yet.
- **Organise into subdirectories.** Likely shape:
  - `apps/src/aiLessons/author/` — author page, lesson generator,
    image generator
  - `apps/src/aiLessons/student/` — student page, tutor, progress
  - `apps/src/aiLessons/teacher/` — progress roll-up
  - `apps/src/aiLessons/lab/` — EmbeddedLab + ProjectManager shim
  - `apps/src/aiLessons/shared/` — types, api client, capabilities

### Hackathon-y caveats

- **Filesystem storage.** All persistence is local JSON under
  `dashboard/tmp/`. That's wiped on container restart and not shared
  across hosts. Anything beyond demo would move to ActiveRecord or
  object storage.
- **LLM cost is unmetered.** Every Run and every checkpoint completion
  triggers a tutor turn and a summary regeneration. A student running
  their code 50 times generates 50 LLM calls. No batching, debouncing,
  or rate limiting.
- **Image GET endpoint skips auth.** Random hex filename acts as a
  capability token. Fine for demo; production would need signed URLs.
- **No section/class filtering on the teacher view.** It shows every
  student we have progress for, period. Filtering by section/class
  would require wiring into the existing `Section`/`Follower` model
  and probably a per-lesson teacher assignment.
- **No CSRF on the image GET / sources GET / progress GET.** Reads are
  all unauthenticated within the user's session; writes use Rails CSRF
  via `HttpClient.put(..., true, ...)`.
- **No tests.** None at all. Anywhere.
- **Old lessons may have a stale shape.** v1 (checkpoints) JSONs are
  migrated to steps on every load but never rewritten on disk; they
  round-trip through the editor as v2 the next time they're saved.
- **The generator and editor lag the format.** `lessonGenerator` emits
  only lab/panels steps, and the editor shows questions steps read-only.
  Both catch up in the authoring-tools phase; until then the exemplars
  are edited as JSON.

## How to run

With dashboard + apps running (see the repo's main `SETUP.md`), open
`/ai_lessons` in the browser.

### Storage layout

```
dashboard/config/ai_lessons/<lessonId>.json   # repo-shipped lessons (read-only via API)

dashboard/tmp/ai_lessons/
├── <lessonId>.json                           # authored LessonPlans
├── images/<lessonId>/<random>.png            # panel illustrations
├── sources/<lessonId>/<userId>/<scope>.json  # per-(lesson, user, scope) saved source
├── inputs/<lessonId>/<userId>.json           # per-(lesson, user) question answers
└── progress/<lessonId>/<userId>.json         # per-(lesson, user) progress + summary
```

Authored `<lessonId>`s are `<timestamp36>-<random6>` (e.g. `tezm2v-b8930f`);
repo-shipped ones are human-readable slugs.  `<labType>` is `weblab2` or
`music`.  Student state for repo-shipped lessons still lives under tmp,
keyed by the lesson id, so reset-progress works on them too.

### Entry point

The whole surface ships as a single SPA bundle: webpack entry
`ai_lessons/app` paired with the Rails view `app.html.haml`.  Every
page path mentioned above hits `AiLessonsController#app`, which just
renders that template.  Once the bundle loads, `RouterProvider` in
`router.tsx` watches `window.location` + `popstate`, and
`AiLessonsApp` swaps the rendered page component accordingly.

`app.html.haml` includes the shared `_lab_head_deps.html.haml` partial
which loads the locale bundles + `blockly.js` that the embedded lab
views depend on at module-evaluation time.
