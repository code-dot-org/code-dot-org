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

### Requirement: Per-widget recorded data paths, discovery, pixel parity
Each widget's data requests SHALL be recorded at implementation start and
consumed through typed wrappers with MSW handlers, reusing the progress
change's wrappers where payloads overlap. The move copies at a recorded
legacy SHA with a divergence ledger entry. Implementation begins with
scenario discovery from widget sources, exposed as visible dev-shell
choices (floor: experiment-on populated, per-widget empty/error states,
experiment-off). Pixel baselines/checkpoints are captured via the shell
harness (modern MUI/DSCO surface) at
`http://localhost-studio.code.org:9000` with serving-checkout validated;
Playwright MCP MAY be used during implementation. If the experiment is
retired upstream before implementation, this change closes with a recorded
disposition instead of silently lapsing.

#### Scenario: Widget contract recorded
- **WHEN** any widget's wrapper schema is authored
- **THEN** it derives from recorded server JSON with parser tests

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the per-widget scenario list with evidence and coverage is in
  the task log and the dev-shell selector
