# Design: teacher-dashboard-student-snapshot

Hardened 2026-07-04 against source in this checkout. The endpoint family
is pinned from `dashboard/config/routes.rb:1252-1266,178` plus client
call sites; unknowns are marked `BLOCKED-EVIDENCE`.

## Source files and ownership

All under `apps/src/templates/studentSnapshot/`. Modern TSX; HttpClient
×29 call sites; MUI ×21, DSCO fontAwesomeV6Icon ×12 / dropdown ×2 /
alert ×2 / textField ×1; legacy `sharedComponents/Spinner` ×2.

| File | Role | Plan |
| --- | --- | --- |
| `StudentSnapshot.tsx` | root; lesson selection (`/student_snapshots/lessons/:unitId`) | port |
| `header/index.tsx` | student/lesson header | port first (frames widgets) |
| `widgetTemplate/` | shared widget frame | port with header |
| `codeWidget/index.tsx`, `Editor.tsx`, `ExemplarCodeWidget.tsx` | student code + exemplar. `Editor.tsx` embeds CodeMirror 6 (`@codemirror/state`, `@codemirror/view`, shared `@cdo/apps/codemirror/editorConfig`) | port; CodeMirror deps become package peer deps; the shared `editorConfig` is extracted or adapted — blocker evidence if its import graph resists |
| `lessonFeedbackWidget/LessonFeedbackWidget.tsx`, `FeedbackTextbox.tsx` | teacher feedback CRUD + AI-generated draft | port |
| `lessonInsightWidget/index.tsx` | lesson insight | port |
| `studentCFUWidget/StudentCFUWidget.tsx` | checks-for-understanding | port |
| `studentLessonProgressDetailsWidget/` | per-lesson progress detail | port; reuses progress-change wrappers where payloads overlap |
| `studentRubricWidget/StudentRubricWidget.tsx` | rubric view; shares `templates/rubrics/` components (`LearningGoals`, `RubricSubmitFooter`, `rubricShapes`/`aiEvaluationShape`) | port with shared-dep handling: rubrics components are consumed, not forked; blocker evidence if their import graph resists |

## API table

Server routes pinned (`routes.rb:1252-1266` for `/student_snapshots`,
`:178,1265-1266` for `/lesson_feedbacks`). All GETs cookie-auth. Client
response types exist in the TSX (`fetchJson<T>` type params — cite:
`CFULevelsData`/`CFULevelResponsesData` in `studentCFUWidget`,
`ExemplarCodeData`/`StudentCodeData` in `codeWidget`, `LessonsData` in
`StudentSnapshot.tsx`, `{json, updated_at}` for student code) — these
types are the client expectation record; runtime captures still gate the
Zod schemata.

| # | Method + path | Params | Consumer |
| - | --- | --- | --- |
| 1 | GET `/student_snapshots/lessons/:unit_id` | path | root lesson list |
| 2 | GET `/student_snapshots/cfu_levels/:lesson_id` | path | CFU widget |
| 3 | GET `/student_snapshots/cfu_responses/:lesson_id` | query `student_id` | CFU widget |
| 4 | GET `/student_snapshots/exemplar_code/:lesson_id` | path | code widget |
| 5 | GET `/student_snapshots/units/:unit_id/lessons/:lesson_id/students/:student_id/code` | path | code widget |
| 6 | GET `/student_snapshots/lesson_insight` | query (BLOCKED-EVIDENCE: capture the built `params` at runtime — constructed dynamically in `lessonInsightWidget/index.tsx`) | insight widget |
| 7 | GET `/student_snapshots/ai_generated_lesson_feedback` | query BLOCKED-EVIDENCE | feedback widget (AI draft) |
| 8 | GET `/student_snapshots/student_has_work_in_lesson` | query BLOCKED-EVIDENCE | gating within widgets |
| 9 | GET `/lesson_feedbacks/saved_feedback` | query (8 call-site references) BLOCKED-EVIDENCE | feedback widget |
| 10 | POST `/lesson_feedbacks` | JSON body BLOCKED-EVIDENCE (capture a legacy save) | feedback create |
| 11 | PATCH/PUT `/lesson_feedbacks/:id` (`resources only: [:create, :update]`) | body BLOCKED-EVIDENCE | feedback update |
| 12 | rubric data (story mocks `/rubrics/find`) | BLOCKED-EVIDENCE: the fetch lives in the shared `templates/rubrics/` components — enumerate the rubric widget's actual runtime calls before wrapping | rubric widget |

Writes (#10, #11) MUST carry CSRF via the standard client; capture one
legacy save to pin headers + body.

## Scenario matrix

Oracles: S = sources above (incl. the TSX response types), stories
(`StudentRubricWidget.story.tsx` mocks), experiment gate Router:288-299.

| Scenario | Flags | Fixture shape | Expected UI | Oracle |
| --- | --- | --- | --- | --- |
| experiment-off | `student-snapshot` off | any | no route, no sidebar entry | Router:288 |
| populated | on | student with code, CFU responses, feedback, rubric | header + all six widgets | S |
| code-only | on | student code, no exemplar | code widget without exemplar pane | S |
| cfu-empty | on | lesson without CFU levels | CFU widget empty state | S |
| feedback-crud | on | no saved feedback → create → update | textbox → POST #10 → PATCH #11; saved_feedback reload | S |
| ai-feedback-draft | on | AI draft available | draft offered per widget behavior | S(#7) |
| no-work-in-lesson | on | `student_has_work_in_lesson` false | per-widget gating | S(#8) |
| rubric-present | on | rubric'd lesson w/ AI evaluation | rubric widget w/ LearningGoals | story mock, S |
| empty-state matrix | on | zero students / no progress | no-students / no-curriculum pages | Router:292-296 |
| error | on | any GET 500 | widget-level error handling per source | S |

## Gate table

| Surface | Gate | Detail |
| --- | --- | --- |
| header + each widget | pixel | modern MUI/DSCO surface. Capture regions: header, each widget card (populated + empty); masks: student names, code content (CodeMirror text), timestamps, AI-generated text |
| feedback CRUD, gating flows | behavior | request-shape tests from captures |
| a11y | axe + keyboard per widget | CodeMirror read-only region reachable; textbox labeled |
| responsive (desktop/laptop) | behavior | widget cards reflow/stack across common desktop widths, 200% zoom, split-screen, narrow laptop; code widget scrolls within its container. Tablet/mobile parity NOT required; no fixed page widths in the feature root |
| copy | en-US verbatim | per widget |

## Design-system mapping

| Legacy | Target |
| --- | --- |
| MUI ×21, DSCO icon/dropdown/alert/textField, `themes` | keep (already DS) |
| `sharedComponents/Spinner` ×2 | MUI CircularProgress (or DSCO spinner if sanctioned at execution) |
| CodeMirror 6 editor | keep (not a DS concern); read-only config preserved |

## Frontend structure intent

Per the program architecture report
(`sdd-experiment/openspec/teacher-dashboard-frontend-architecture-report.md`):

- Package boundary: UI lands in
  `packages/teacher-dashboard/src/features/studentSnapshot/`, widgets as
  subfolders mirroring the legacy layout, behind a lazy entry — the
  snapshot chunk (including its CodeMirror 6 dependency) must not enter
  the shell entry chunk. The full 12-row endpoint family lives in CORE as
  DashboardApi domains (`core/src/api/dashboard/studentSnapshots/` +
  `dashboard/lessonFeedbacks/`, plus the rubric calls in whatever domain
  the shared rubrics components resolve to), per the human ruling that
  DashboardApi is the general dashboard backend wrapper client. The
  progress-overlapping payloads REUSE the progress core domain — never a
  second wrapper. The feature consumes typed hooks; its `fixtures/`
  compose MSW scenarios (incl. write-through feedback state) over core's
  default handlers.
- State boundary: Query-only — no transitional store and no bridge; the
  legacy widgets are already per-widget `fetchJson`, which maps 1:1 onto
  Query hooks in the feature's api layer (the network-call-site rewrite
  is the only structural rewrite here).
- Shared-dependency boundary: `templates/rubrics/` components and
  `@cdo/apps/codemirror/editorConfig` are consume-not-fork
  (BLOCKED-EVIDENCE items pin their graphs); CodeMirror 6 packages enter
  as peer deps. `sharedComponents/Spinner` is replaced at move time by
  the package's shared loading idiom (resilience-ux components) rather
  than copied. Every copy/consumption decision gets a
  `docs/legacy-mirror.md` row (this feature carries the recorded-SHA
  divergence ledger because the legacy surface is under active
  development).
- Modernization boundary: this surface is already DS-era; the only
  mapping entries (Spinner, theme tokens) execute at move time — there is
  no deferred modernization pass for this tab.

## Decisions

- D1. Port order: header + widgetTemplate → code → CFU → feedback →
  insight → progress-details → rubric (rubric last: shared-dep heaviest).
- D2. Copy at a recorded legacy SHA with a divergence ledger entry
  (experiment surface under active development; position 16 minimizes the
  window). If the experiment is retired upstream first, the change closes
  with a recorded disposition.
- D3. `studentLessonProgressDetailsWidget` reuses progress-change wrappers
  where payloads overlap; a payload diff is recorded evidence, not a
  silent re-wrap.

## Open questions (each has a blocking task)

- BLOCKED-EVIDENCE (#6-#9 query params; #10/#11 bodies + headers; #12
  rubric call sites): runtime captures / shared-component read before
  wrappers.
- BLOCKED-EVIDENCE (CodeMirror `editorConfig` import graph): confirm
  `@cdo/apps/codemirror/editorConfig` extracts cleanly before the code
  widget port.
