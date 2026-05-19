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
- Source carry-over: all checkpoints in a lesson that target the same
  lab type share a single project. Editing weblab2 in checkpoint 2 and
  then returning in checkpoint 5 picks up exactly where you left off.
  Sources are stored at
  `dashboard/tmp/ai_lessons/sources/<lessonId>/<labType>.json`.
- Music's Blockly workspace JSON (not the executed playback events) is
  what the tutor sees when evaluating, so success criteria like "use a
  Repeat block" actually work.
- "Check my work" button + auto-check on lab Run/Play. The tutor
  receives the live source snapshot and returns `stay` (with feedback)
  or `advance` (which navigates to the next checkpoint).
- Demo nav arrows in the tutor sidebar (Back / Skip to next) bypass
  tutor approval for presentations.
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
  custom `ProjectManager` into `Lab2Registry`, dispatches
  `setHideResourcePanel`, wraps in `NullRubricProvider` +
  `ExtraLinksButtonContext` + `DialogManager`, and threads
  `lessonId`/`labType` through everywhere. A few small upstream changes
  in `ResourcePanel`, `InfoPanel`, and `MusicLabView` opt those views
  out of rendering when `state.lab.hideResourcePanel` is true. Worth
  reviewing whether the abstraction belongs in lab2 itself or whether
  there's a cleaner extension point.
- **Big files.** `AuthorPage.tsx`, `StudentPage.tsx`, and `EmbeddedLab.tsx`
  are all north of 400 LOC. Break out smaller components: the carousel,
  the lab-mount setup hook, the panels carousel, the chat composer.
- **Fix weblab2 resizing.** The Web Lab 2 view doesn't always re-measure
  its inner panels when its container changes size — switching
  checkpoints or resizing the window can leave the editor or preview
  pinned to a stale width.
- **Per-checkpoint starter code.** Today the source is shared across all
  same-lab checkpoints in a lesson, but there's no way for the author to
  seed a checkpoint with a specific starting state (e.g. "checkpoint 3
  begins with a broken loop the student has to fix"). Need authoring UI
  for starter code + a way to plumb it through the source-carryover
  logic.
- **Per-checkpoint "continue vs fresh" toggle.** Right now every
  checkpoint of a given lab type picks up from the previous one's
  source. The author should be able to mark a checkpoint as starting
  fresh — useful when a new concept needs a clean slate, or when the
  starter code (above) is meant to replace what the student had.
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
- **Old lessons may have a stale shape.** We dropped `introduction` and
  `instructions` from the schema; old saved JSONs that still have those
  fields load fine (extra fields are ignored) but they won't round-trip
  through the editor.

## How to run

With dashboard + apps running (see the repo's main `SETUP.md`), open
`/ai_lessons` in the browser.

### Storage layout

```
dashboard/tmp/ai_lessons/
├── <lessonId>.json                           # the LessonPlan
├── images/<lessonId>/<random>.png            # panel illustrations
├── sources/<lessonId>/<labType>.json         # student's saved source per lab type
└── progress/<lessonId>/<userId>.json         # per-(lesson, user) progress + summary
```

`<lessonId>` is `<timestamp36>-<random6>` (e.g. `tezm2v-b8930f`).
`<labType>` is one of `weblab2`, `music`, `panels`.

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
