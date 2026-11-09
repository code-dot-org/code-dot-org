# Proposal: teacher-dashboard-course-unit-overview

Position 12 in the migration sequence. Depends on `teacher-dashboard-shell`.
Deliberately sequenced just before progress (position 13): both share the
`progressRedux` data machinery, and this change's parser/adapters are
reused by progress.

## Why

The course and unit overview tabs
(`.../sections/:sectionId/courses/:courseVersionName?`,
`.../courses/:courseVersionName/units/:unitPosition`, and
`.../unit/:unitName?`) render `TeacherCourseOverview` and
`TeacherUnitOverview` — components shared with the public course pages,
carrying announcements, hidden-lesson state, view-as, and lesson lock over
`progressRedux`. The MODULARITY experiment swaps WHICH overview key the
sidebar's course-content group links to (`nestedUnitOverview` vs
`unitOverview`, Router:118) — it does not gate a whole group; both arms are
parity targets. Course overview has the no-curriculum empty state
(Router:270-283); the single-unit-course behavior (auto-landing on unit 1,
no unit breadcrumb) is pinned by the local_nav_v2 Cucumber scenario.

## What Changes

- Candidate routes for course overview, nested unit overview, and unit
  overview render the moved teacher overviews inside the shell, with
  announcements, hidden-lesson toggles, view-as, lesson lock, and the
  no-curriculum empty state (course overview only).
- MODULARITY parity: both arms of the sidebar link swap work against the
  candidate routes.
- `progressRedux` and its data payloads (script structure, unit summary)
  move page-scoped with the shell bridge (roster pattern); recorded
  contracts for every payload. This is shared infrastructure for the
  progress change.
- Dual-copy policy: the shared overview components are copied into the
  package; public course pages keep the legacy copies untouched.
- Shell per-tab map flips the overview entries to candidate routes.
- No pixel gate (legacy shared JS/JSX); behavior, copy, a11y parity;
  explicit design-system mapping recorded (see spec).

## Capabilities

### New Capabilities

- `teacher-dashboard-course-unit-overview-page`: the moved teacher course
  and unit overviews — routes, announcements, hidden lessons, view-as,
  lesson lock, MODULARITY arms, empty state, typed data paths, scenarios.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (overview area + shared
  progressRedux port), core wrappers/mocks, Studio routes (three route
  shapes), shell map entries. No Rails changes; public course pages
  untouched.
