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

#### Scenario: CSV download
- **WHEN** the teacher downloads progress CSV
- **THEN** the file content matches the legacy download for the same data

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
endpoints: teacher panel, lesson lock (dialog + state round-trip), teacher
scores (`/dashboardapi/v1/teacher_scores`), view-as-student, and the
more-details dialog.

#### Scenario: Lesson lock round-trip
- **WHEN** a teacher locks/unlocks a lesson from the progress tab
- **THEN** lock state persists via the legacy endpoint and the grid
  reflects it as legacy

#### Scenario: View as student
- **WHEN** view-as-student is toggled
- **THEN** the view renders the student perspective with legacy semantics

### Requirement: Global Edition gating at parity
The candidate SHALL reproduce the `GlobalEditionWrapper` behavior for
SectionProgressV2: in a Global Edition region that hides the component, the
candidate hides it identically (driven by `<html data-ge-region>`);
`fa-teacher-dashboard.spec.ts` passes against the candidate route.

#### Scenario: fa region
- **WHEN** the fa-region Playwright spec runs against the candidate route
- **THEN** it passes without weakened assertions

### Requirement: Data paths, discovery, performance, DS mapping
Progress data SHALL flow through typed wrappers for all endpoints
(`section_level_progress`, script structure, unit summary,
`teacher_scores`) with
recorded-JSON schemata and MSW handlers; the three slices move page-scoped
as one store module (extending the overview change's module — reuse is a
requirement, deviation must be recorded). Implementation begins with
behavior-scenario discovery (jest suite, progress_v2 feature incl. its
@eyes scenarios re-expressed as structural checks, GE spec) exposed as
visible dev-shell choices (floor: populated-large, populated-small,
zero-students, no-progress, locked-lesson, view-as, ge-region, error).
Performance is a named gate: on a realistic large section the candidate
grid MUST NOT be perceptibly slower than legacy (render + interaction
timings recorded on the same machine). No pixel gate; DS mapping recorded
for modernization: grid table → MUI Table or DSCO table primitives,
skeletonize-content → MUI Skeleton, react-tooltip → DSCO tooltip, legacy
buttons → MUI Button, dropdowns → DSCO dropdown (icons/links already
DSCO).

#### Scenario: Performance gate
- **WHEN** the large-section fixture renders on candidate and legacy
- **THEN** recorded timings show no perceptible regression, or the change
  documents and resolves the gap before landing

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and per-sub-split coverage is in
  the task log and the dev-shell selector
