# Design: teacher-dashboard-assessments

Hardened 2026-07-04 against source in this checkout. One prior claim is
CORRECTED (feedback download is client-side). Unknowns are marked
`BLOCKED-EVIDENCE` with the capture needed.

## Source files and ownership

All under `apps/src/templates/sectionAssessments/`.

| File | Role | Plan |
| --- | --- | --- |
| `sectionAssessmentsRedux.js` (~1,240 lines; loaders at :1182-1240) | slice: loads, selectors, submission-status accounting (`multi_correct/multi_count/match_correct/match_count/submitted/url` per student, :770-786) | move (page-scoped + shell bridge) |
| `AssessmentSelector.jsx` | assessment/survey picker | move |
| `MultipleChoiceAssessmentsContainer/Table`, `MultipleChoiceSurveyOverviewTable.jsx`, `MultipleChoiceByStudentContainer/Table` (as present in the dir) | MC tables | move |
| `MatchAssessmentsContainer/Table` | match tables | move |
| `FreeResponsesAssessmentsContainer/Table`, `FreeResponseDetailsDialog.jsx` (DSCO dialog shell) | free-response + detail dialog | move |
| `SubmissionStatusAssessmentsContainer` (+ its CSV headers) | per-student status | move |
| `FeedbackDownload.jsx` | client-side CSV via `react-csv` `CSVLink` from redux feedback data (imports: CSVLink, MuiButton, SafeMarkdown) | move; `SafeMarkdown` → `@code-dot-org/markdown` |
| `assessmentDataShapes.js` | client-side shape documentation (PropTypes) | move; treated as the client's expectation record, cross-checked against runtime captures |
| `assessmentsTestHelpers.js` + jest suite | oracle | re-express against moved slice |

Shared: unit selection via `redux/unitSelectionRedux.js` — consumed
through the shared unit-selector re-expression built by
`teacher-dashboard-text-responses` (position 8).

## API and mutation table

All four are `$.ajax` GETs, cookie auth, no side effects
(sectionAssessmentsRedux.js:1182-1240):

| # | Method + path | Query params | Consumed response |
| - | --- | --- | --- |
| 1 | GET `/dashboardapi/assessments` | `script_id` | question structure per assessment (client shape: `assessmentDataShapes.js`) |
| 2 | GET `/dashboardapi/assessments/section_responses` | `section_id`, optional `script_id`, optional `course_version_id` (:1183-1194) | per-student responses incl. `multi_correct`, `multi_count`, `match_correct`, `match_count`, `submitted`, timestamps, `url` (level URL) |
| 3 | GET `/dashboardapi/assessments/section_surveys` | `script_id`, `section_id` | survey questions + anonymous responses |
| 4 | GET `/dashboardapi/assessments/section_feedback` | `script_id`, `section_id` | comment + rubric feedback rows (feeds FeedbackDownload CSV) |

Response body shapes: BLOCKED-EVIDENCE — runtime captures from local
Rails for each of #1-#4 across MC/match/free-response/survey fixtures,
cross-checked against `assessmentDataShapes.js` (where the PropTypes and
the capture disagree, the capture wins and the discrepancy is recorded).

There are no mutations on this tab. Both CSV downloads (submission status,
feedback) are client-generated from loaded state — CORRECTED: no download
endpoint exists; parity is generated-file content equality.

## Scenario matrix

Oracle key: J = sectionAssessments jest suite, C1/C2 =
`teacher_dashboard_assessments1/2.feature`, CF =
`assessment_feedback_download.feature`, S = source.

| Scenario | Fixture shape | Expected UI | Oracle |
| --- | --- | --- | --- |
| mc-populated | MC assessment w/ mixed correct/incorrect | MC overview + by-student tables | C1, J |
| match-populated | match assessment | match table w/ per-answer accounting | J |
| free-response-populated | FR assessment | FR table; detail dialog per response | C2, J |
| submission-status | mix of submitted/in-progress/untouched | status per student incl. timestamps | S(:770-786), J |
| surveys | anonymous survey w/ responses | survey tables; anonymity preserved | J; BLOCKED-EVIDENCE: pin the server-side anonymity rule (controller for #3) before authoring this fixture |
| feedback-csv | rubric + comment feedback | FeedbackDownload CSVLink content equals legacy | CF |
| status-csv | populated | submission-status CSV content equals legacy | S |
| multi-assessment | ≥2 assessments in unit | selector switches tables | J |
| zero-students / no-progress | empty-state matrix | no-students / no-curriculum pages | Router:239-241 |
| error | any GET 500 | resilience carve-out error state | resilience spec |

## Gate table

| Surface | Gate | Detail |
| --- | --- | --- |
| all tables + selector | behavior + copy + a11y; NO pixel | legacy reactabular (×9) JSX |
| FreeResponseDetailsDialog | behavior + a11y (keyboard-complete, axe) | DSCO dialog shell retained |
| both CSVs | content equality | generated-file diff vs legacy for identical state |

## Design-system mapping

Verified imports: reactabular-table + sortabular ×9, react-tooltip ×1,
DSCO dialog ×4, DSCO dropdown ×2, DSCO link ×7, fontAwesomeV6Icon ×6,
@mui ×13.

| Legacy | Target (modernization pass) |
| --- | --- |
| reactabular + sortabular tables | MUI Table, sticky header, pinned sort |
| react-tooltip | DSCO tooltip |
| DSCO dialog/dropdown/link/icon, MUI Button/Typography | keep |
| `SafeMarkdown` (FeedbackDownload) | `@code-dot-org/markdown` (done in the move) |

## Decisions

- D1. Move-not-rewrite, roster pattern: slice page-scoped + bridge;
  components move kind-by-kind (MC → match → FR + dialog → surveys →
  status/CSV), each kind landing with its tests.
- D2. `assessmentDataShapes.js` is a client-side expectation record, not a
  contract: captures win on conflict, recorded.
- D3. Unit selection consumed from the shared re-expression
  (text-responses change); no second `unitSelection` port.

## Open questions (each has a blocking task)

- BLOCKED-EVIDENCE (responses for #1-#4): runtime captures per fixture
  kind.
- BLOCKED-EVIDENCE (survey anonymity rule): read the `section_surveys`
  controller/serializer before the surveys fixture; the client renders
  whatever the server sends, so the rule lives server-side.
