# Spec: teacher-dashboard-assessments-page

## ADDED Requirements

### Requirement: Assessments tab at parity
The candidate route SHALL render the moved assessments tab at
`/frontend-studio/teacher_dashboard/sections/:sectionId/assessments`:
assessment/survey selector, multiple-choice tables, match tables,
free-response tables with detail dialogs, per-student submission status,
anonymous survey results, and the legacy empty-state matrix.

#### Scenario: Each table kind renders
- **WHEN** the candidate tab renders fixtures with MC, match, and
  free-response assessments
- **THEN** each table kind renders the same columns, per-student rows, and
  detail dialogs as legacy (`teacher_dashboard_assessments1/2.feature` are
  the oracles)

#### Scenario: Submission status
- **WHEN** some students have submitted and others have not
- **THEN** the submission-status accounting matches legacy exactly

#### Scenario: Anonymous survey threshold
- **WHEN** survey results are below the anonymity threshold legacy enforces
- **THEN** the candidate withholds/aggregates results identically

### Requirement: Feedback download at parity
The assessment-feedback CSV download SHALL produce the same file content as
legacy for the same data (`assessment_feedback_download.feature` is the
oracle), through the typed wrapper with download semantics preserved.

#### Scenario: CSV round-trip
- **WHEN** the teacher downloads feedback on the candidate tab
- **THEN** the CSV matches the legacy download for the same fixture data

### Requirement: Typed data paths and page-scoped state
The assessments data SHALL be consumed through typed core wrappers — the
`/dashboardapi/assessments*` family (assessments, section_surveys,
section_responses, section_feedback) — with recorded-JSON schemata
(parser tests) and MSW handlers;
`sectionAssessmentsRedux` moves page-scoped with the shell bridge and its
jest coverage re-expressed.

#### Scenario: Family recorded per kind
- **WHEN** wrapper schemata are authored
- **THEN** each derives from recorded JSON for MC, match, free-response,
  and survey fixtures

### Requirement: Discovery gate and non-pixel parity gates
Implementation SHALL begin with behavior-scenario discovery from the legacy
oracles (sectionAssessments jest suite, the two assessments Cucumber
features, the feedback-download feature, stories) exposed as visible
dev-shell choices (floor: mc-populated, match-populated,
free-response-populated, surveys, no-submissions, zero-students,
no-progress, error). No pixel gate (non-DSCO legacy JSX); gates are
behavior, en-US copy, axe + keyboard (including the detail dialogs).
Design-system mapping (recorded here, executed by the modernization pass;
grep-verified usage: reactabular ×9, react-tooltip, DSCO dialog ×4):
reactabular-table + sortabular → MUI Table; react-tooltip → DSCO tooltip;
detail dialogs keep their DSCO dialog shells; DSCO
dropdown/link/fontAwesomeV6Icon retained; legacy buttons → MUI Button.

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence, coverage, and the distinct
  UI-state enumeration per table kind is in the task log and the dev-shell
  selector
