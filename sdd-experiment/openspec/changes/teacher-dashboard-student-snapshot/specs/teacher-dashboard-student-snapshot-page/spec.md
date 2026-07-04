# Spec: teacher-dashboard-student-snapshot-page

## ADDED Requirements

### Requirement: Student snapshot under its experiment gate
The candidate route SHALL render the ported student snapshot at
`/frontend-studio/teacher_dashboard/sections/:sectionId/student_snapshot`
when experiment `student-snapshot` is on: the snapshot header and all six
widgets (code, lesson feedback, lesson insight, student CFU, lesson
progress details, student rubric) at behavior/copy parity, with the
no-students/no-curriculum empty-state matrix. When the experiment is off
the route and sidebar entry are absent. Both arms are scenario axes.

#### Scenario: Experiment on, populated
- **WHEN** the experiment is on and the tab renders a section with student
  data
- **THEN** the header and each widget render the same content as legacy
  for the same data

#### Scenario: Experiment off
- **WHEN** the experiment is off
- **THEN** neither sidebar entry nor route exists, as legacy

#### Scenario: Empty-state matrix
- **WHEN** the section has zero students, or students but no progress
- **THEN** the corresponding empty-state page renders as legacy

### Requirement: Pinned endpoint family with capture-gated schemata
The snapshot's data SHALL flow through typed wrappers implementing the
12-row API table pinned in design.md — the `/student_snapshots/*` GET
family (`lessons/:unit_id`, `cfu_levels/:lesson_id`,
`cfu_responses/:lesson_id?student_id`, `exemplar_code/:lesson_id`,
`units/:unit_id/lessons/:lesson_id/students/:student_id/code`,
`lesson_insight`, `ai_generated_lesson_feedback`,
`student_has_work_in_lesson`; routes.rb:1252-1261) plus the feedback CRUD
(`GET /lesson_feedbacks/saved_feedback`, `POST /lesson_feedbacks`,
`PATCH /lesson_feedbacks/:id`; routes.rb:1265-1266) and the rubric
widget's calls (which live in the shared `templates/rubrics/` components).
Zod schemata are authored only after the BLOCKED-EVIDENCE items resolve:
runtime captures for the dynamically-built query params (#6-#9), the
feedback write bodies/headers (#10-#11), and an enumeration of the rubric
widget's actual runtime calls (#12). The client's `fetchJson<T>` response
types (`CFULevelsData`, `CFULevelResponsesData`, `ExemplarCodeData`,
`StudentCodeData`, `LessonsData`) are the expectation record and are
cross-checked against captures. `studentLessonProgressDetailsWidget`
reuses progress-change wrappers where payloads overlap. Writes carry CSRF
via the standard client.

#### Scenario: Capture-gated schemata
- **WHEN** any snapshot wrapper schema is authored
- **THEN** its recorded fixture (or shared-component call enumeration for
  the rubric widget) exists first and parser tests consume it

#### Scenario: Feedback CRUD round-trip
- **WHEN** a teacher writes feedback, saves, edits, and saves again
- **THEN** the client issues POST then PATCH per the recorded contracts
  and `saved_feedback` reflects the latest state

### Requirement: Scenario matrix is the coverage; pixel parity per widget
The design.md scenario matrix SHALL be the coverage contract (10 rows:
experiment-off, populated, code-only, cfu-empty, feedback-crud,
ai-feedback-draft, no-work-in-lesson, rubric-present, empty-state matrix,
error) — one MSW fixture and visible dev-shell choice plus
a test per row. Pixel baselines/checkpoints are captured per the gate
table (header + each widget card, populated and empty; masks: student
names, CodeMirror text, timestamps, AI-generated text) via the shell
harness at `http://localhost-studio.code.org:9000` with serving-checkout
validated; Playwright MCP MAY be used during implementation. The move
copies at a recorded legacy SHA with a divergence ledger entry; if the
experiment is retired upstream first, this change closes with a recorded
disposition instead of silently lapsing.

#### Scenario: Matrix covered
- **WHEN** implementation completes
- **THEN** every matrix row has its fixture, dev-shell choice, and test,
  and every widget has masked pixel baselines/checkpoints
