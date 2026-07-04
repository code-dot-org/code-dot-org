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
`GET /dashboardapi/section_text_responses/:id` SHALL be consumed through a
typed core wrapper with a recorded-JSON schema (parser tests) and an MSW
handler; the moved data module uses the core transport with request shapes
preserved.

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
