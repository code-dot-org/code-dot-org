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

### Hackathon-y caveats

- **Filesystem storage.** All persistence is local JSON under
  `dashboard/tmp/`. That's wiped on container restart and not shared
  across hosts. Anything beyond demo would move to ActiveRecord or
  object storage.
- **Image GET endpoint skips auth.** Random hex filename acts as a
  capability token. Fine for demo; production would need signed URLs.
- **No CSRF on the image GET / sources GET / progress GET.** Reads are
  all unauthenticated within the user's session; writes use Rails CSRF
  via `HttpClient.put(..., true, ...)`.
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
`app.html.haml` includes the shared `_lab_head_deps.html.haml` partial
which loads the locale bundles + `blockly.js` that the embedded lab
views depend on at module-evaluation time.
