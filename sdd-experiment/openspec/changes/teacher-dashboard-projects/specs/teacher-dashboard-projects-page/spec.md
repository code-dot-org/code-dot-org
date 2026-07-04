# Spec: teacher-dashboard-projects-page

## ADDED Requirements

### Requirement: Projects tab at parity
The candidate route SHALL render the moved projects list at
`/frontend-studio/teacher_dashboard/sections/:sectionId/projects`: each
student project with name, type, student, updated-at, and links into the
project, matching legacy for the same data.

#### Scenario: Populated list
- **WHEN** the candidate tab renders a section whose students have projects
- **THEN** rows, columns, and project links match the legacy tab

### Requirement: Single-sided empty-state gate preserved
The projects tab SHALL show the no-students empty state when the section
has zero students, and SHALL NOT show a no-curriculum empty state under any
data (the legacy quirk at Router:185-199 — projects exist independent of
assigned curriculum).

#### Scenario: Students but no curriculum
- **WHEN** the section has students, projects, and no curriculum assignment
- **THEN** the projects list renders normally (no no-curriculum page)

#### Scenario: Zero students
- **WHEN** the section has zero students
- **THEN** the no-students page renders as legacy

### Requirement: Typed data path, discovery gate, non-pixel parity
`GET /dashboardapi/v1/projects/section/:sectionId` SHALL be consumed
through a typed wrapper with recorded-JSON schema (parser tests) and MSW
handler. Implementation begins with behavior-scenario discovery (projects
jest coverage, component sources) exposed as visible dev-shell choices
(floor: populated, zero-students, students-no-projects, error). No pixel
gate (non-DSCO legacy JSX); behavior, en-US copy, axe + keyboard gates.
Design-system mapping (recorded here, executed by the modernization pass):
reactabular-table + sortabular → MUI Table; existing DSCO
modal/dropdown/link/segmentedButtons/fontAwesomeV6Icon usage retained;
legacy buttons → MUI Button.

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector
