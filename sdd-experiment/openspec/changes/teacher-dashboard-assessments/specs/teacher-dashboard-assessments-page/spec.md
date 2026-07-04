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

### Requirement: CSV downloads at parity (client-generated)
Both CSV downloads SHALL produce byte-equal content to legacy for
identical state: the feedback CSV (`FeedbackDownload.jsx`, a `react-csv`
`CSVLink` over the `section_feedback` data —
`assessment_feedback_download.feature` is the oracle) and the
submission-status CSV. CORRECTED from prior planning: there is no server
download endpoint; both files are client-generated from loaded redux
state, so parity is generated-content equality, not a wrapper concern.

#### Scenario: Feedback CSV equality
- **WHEN** the teacher downloads feedback on the candidate tab
- **THEN** the generated CSV equals the legacy file for the same fixture
  data (Cucumber oracle)

#### Scenario: Submission-status CSV equality
- **WHEN** the teacher downloads submission status
- **THEN** the generated CSV equals legacy for the same state

### Requirement: Typed data paths and page-scoped state
The assessments data SHALL be consumed through typed core wrappers
implementing the API table pinned in design.md — four cookie-auth GETs
with exact query params: `/dashboardapi/assessments?script_id`,
`/dashboardapi/assessments/section_responses?section_id[&script_id]
[&course_version_id]`, `/dashboardapi/assessments/section_surveys` and
`.../section_feedback` (both `script_id`+`section_id`), per
`sectionAssessmentsRedux.js:1182-1240`. No mutations exist on this tab.
Response schemata are authored only from the BLOCKED-EVIDENCE runtime
captures (per fixture kind), cross-checked against
`assessmentDataShapes.js` — captures win on conflict, discrepancies
recorded. `sectionAssessmentsRedux` moves page-scoped with the shell
bridge and its jest coverage re-expressed; the submission-status
accounting fields (`multi_correct`, `multi_count`, `match_correct`,
`match_count`, `submitted`, `url`, redux :770-786) are pinned by test.

#### Scenario: Family recorded per kind
- **WHEN** wrapper schemata are authored
- **THEN** each derives from recorded JSON for MC, match, free-response,
  and survey fixtures (the BLOCKED-EVIDENCE tasks are blocking)

#### Scenario: Survey anonymity rule pinned first
- **WHEN** the surveys fixture is authored
- **THEN** the server-side anonymity rule has been read from the
  `section_surveys` controller and recorded (the client renders what the
  server sends; the rule is not client-side)

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
