# Spec: teacher-dashboard-progress-page

## ADDED Requirements

### Requirement: Progress grid at parity
The candidate route SHALL render the moved progress experience at
`/frontend-studio/teacher_dashboard/sections/:sectionId/progress`: unit
selector, lesson columns with expandable level detail, per-student rows,
icon key and legend, CSV download, skeleton loading columns, and the legacy
empty-state matrix (no-students; no-curriculum when no student has
progress). Grid values match legacy for the same data
(`teacher_dashboard_progress_v2.feature` and the 24-file jest suite are the
oracles).

#### Scenario: Populated grid
- **WHEN** the candidate tab renders a section with progress across a
  multi-lesson unit
- **THEN** lesson/level columns, expansion, per-student states, and legend
  match legacy

#### Scenario: Unit switch
- **WHEN** the teacher switches units in the selector
- **THEN** the grid reloads for the selected unit with legacy selection
  semantics (moved `unitSelection` slice)

#### Scenario: CSV download (client-generated)
- **WHEN** the teacher downloads level or lesson progress CSV
- **THEN** the client-side generated file (`level_progress_<unit>.csv` /
  `lesson_progress_<unit>.csv`, Blob-built from loaded grid state per
  `DownloadProgressCsv.tsx:124,186,209-227` — no server endpoint) is
  byte-equal to legacy output for identical state

#### Scenario: Paginated load for large sections
- **WHEN** the section has more than 20 students (per-page constant 20,
  `sectionProgressLoader.js:19,71-92`)
- **THEN** the candidate fans out the same parallel page requests and the
  merged grid equals the single-page case's semantics

#### Scenario: Bonus levels follow lessonExtras
- **WHEN** the section toggles `lessonExtras`
- **THEN** bonus levels appear (on) or are filtered from columns (off), per
  `sectionProgressLoader.js:142-145`

### Requirement: Floating chrome at parity
The floating header and floating scrollbar SHALL reproduce legacy
positioning behavior: the header pins during vertical scroll, the
scrollbar tracks horizontal grid overflow, both at pinned positions
asserted at defined scroll offsets.

#### Scenario: Scroll positions
- **WHEN** the grid scrolls vertically and horizontally in tests
- **THEN** header and scrollbar positions match the legacy behavior at the
  same offsets

### Requirement: Interactive surfaces at parity
The interactive surfaces SHALL behave as legacy, driving the same
endpoints: lesson lock (`GET /api/lock_status?script_id=` +
`POST /api/lock_status {updates: [{user_level_data, locked,
readonly_answers}]}`, changed-rows-only, `lessonLockRedux.js:203-226,
327-331`), view-as-student (state-only on this tab — no API call; links
carry the student perspective), and the more-details dialog. CORRECTED
from prior planning: teacher panel and `/dashboardapi/v1/teacher_scores`
are NOT part of this tab (zero references in `apps/src` for
teacher_scores; no teacher-panel usage in `sectionProgressV2/`) and are
out of scope.

#### Scenario: Lesson lock round-trip
- **WHEN** a teacher locks/unlocks a lesson from the progress tab
- **THEN** only changed rows are POSTed to `/api/lock_status` and the grid
  reflects the refetched state as legacy

#### Scenario: View as student
- **WHEN** view-as-student is toggled
- **THEN** the view renders the student perspective with legacy semantics
  and no network request is issued from this tab

#### Scenario: teacher_scores stays out
- **WHEN** implementation starts
- **THEN** a re-run of `grep -r teacher_scores apps/src` confirms zero
  client references (blocking task); any hit reopens the scope question
  before code is written

### Requirement: Global Edition gating at parity
The candidate SHALL reproduce the `GlobalEditionWrapper` behavior for
SectionProgressV2: in a Global Edition region that hides the component, the
candidate hides it identically (driven by `<html data-ge-region>`);
`fa-teacher-dashboard.spec.ts` passes against the candidate route.

#### Scenario: fa region
- **WHEN** the fa-region Playwright spec runs against the candidate route
- **THEN** it passes without weakened assertions

### Requirement: Data paths, discovery, performance, DS mapping
Progress data SHALL flow through typed wrappers implementing the API table
pinned in this change's design.md: (1)
`GET /dashboardapi/script_structure/courses/:courseId/units/:unitPosition`
(consumed fields per `sectionProgressLoader.js:117-130`); (2)
`GET /dashboardapi/section_level_progress/:sectionId?script_id&page&per=20`
(consumed: `student_progress`, `student_last_updates`; paginated fan-out);
(3) `GET/POST /api/lock_status`. Response-body schemata are authored ONLY
from runtime captures (BLOCKED-EVIDENCE tasks: JSON for #1-#3 from local
Rails with small and >20-student sections; request headers of one legacy
lock POST to pin the `$.ajax` CSRF mechanism). The slices move page-scoped
as one store module (extending the overview change's module — reuse is a
requirement, deviation must be recorded). The scenario matrix in design.md
(14 rows: populated-small/large, zero-students, no-progress,
lesson-extras-on/off, refresh-path, unit-switch, locked-lesson, view-as,
csv-download, ge-region, skeleton-loading, error) is the coverage
contract; each row becomes an MSW fixture exposed as a visible dev-shell
choice plus a component test citing its oracle. Performance is a named
gate: on the populated-large fixture the candidate grid MUST NOT be
perceptibly slower than legacy (render + unit-switch timings, same
machine). The tab MUST be responsive within desktop/laptop constraints
(common desktop widths, 200% browser zoom, split-screen, narrow laptop:
no overlap or unusable controls; the grid scrolls in its own container) —
tablet/mobile parity is NOT required, and layout choices must not bake in
fixed page widths that would block future mobile work. No pixel gate
(custom non-DSCO grid; the @eyes Cucumber
scenarios re-express as structural assertions); the DS mapping table in
design.md (grid stays custom; react-tooltip → DSCO tooltip;
skeletonize-content → MUI Skeleton; MoreDetailsDialog → DSCO dialog) is
executed by the modernization pass, not here. The loader's `logToCloud`
latency page-actions (LoadScriptProgressStarted/Finished) are emitted with
the same names.

#### Scenario: Schemata only from captures
- **WHEN** any progress Zod schema is authored
- **THEN** its recorded-JSON fixture exists first and the parser test
  consumes it (the BLOCKED-EVIDENCE tasks are blocking, not advisory)

#### Scenario: Performance gate
- **WHEN** the large-section fixture renders on candidate and legacy
- **THEN** recorded timings show no perceptible regression, or the change
  documents and resolves the gap before landing

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and per-sub-split coverage is in
  the task log and the dev-shell selector
