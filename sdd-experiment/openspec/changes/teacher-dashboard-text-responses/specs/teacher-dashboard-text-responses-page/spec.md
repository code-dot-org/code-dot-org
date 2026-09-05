# Spec: teacher-dashboard-text-responses-page

## ADDED Requirements

### Requirement: Text responses tab at parity
The candidate route SHALL render the moved text-responses tab at
`/frontend-studio/teacher_dashboard/sections/:sectionId/text_responses`:
the per-unit free-text response table (student, lesson/level, response,
link to the student's work), the lesson selector, and the legacy
empty-state matrix (no-students; no-curriculum when no student has
progress).

#### Scenario: Populated responses
- **WHEN** the candidate tab renders a section whose students have
  free-text responses in the selected unit
- **THEN** rows, columns, response text, and work links match the legacy
  tab

#### Scenario: Lesson selector filters
- **WHEN** the teacher picks a lesson in the selector
- **THEN** the table filters to that lesson's responses, as legacy

#### Scenario: Empty-state matrix
- **WHEN** the section has zero students, or students but no progress
- **THEN** the corresponding empty-state page renders as legacy

### Requirement: Typed data path
The pinned request SHALL be consumed through a typed DashboardApi wrapper
in `core/src/api/dashboard/...`:
`GET /dashboardapi/section_text_responses/:sectionId[?script_id=]`,
`credentials: 'same-origin'` (`textReponsesDataApi.js:5-15` — note the
legacy filename typo travels with the move), with the response schema
capture-gated (the client post-processes via
`convertTextResponseServerData`, so the recorded RAW response is the
contract, the converter moves with tests) and a default MSW handler in
core; the feature package owns scenario fixtures only.

#### Scenario: Contract break is loud
- **WHEN** a consumed field is dropped from a recorded payload in tests
- **THEN** the parser test fails

### Requirement: Discovery gate and non-pixel parity gates
Implementation SHALL begin with behavior-scenario discovery from the legacy
oracles (textResponses jest coverage, stories, component sources) exposed
as visible dev-shell choices (floor: populated, filtered-by-lesson,
zero-students, no-progress, error). No pixel gate (non-DSCO legacy JSX);
gates are behavior parity, en-US copy parity, axe + keyboard. The
unit-selector re-expression built here is shared with the assessments tab.
Design-system mapping (recorded here, executed by the modernization pass):
reactabular-table + sortabular → MUI Table; existing DSCO
simpleDropdown/link/fontAwesomeV6Icon usage retained; MUI Typography for
headings.

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector
