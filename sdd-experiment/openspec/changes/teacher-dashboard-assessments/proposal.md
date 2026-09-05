# Proposal: teacher-dashboard-assessments

Position 9 in the migration sequence. Depends on `teacher-dashboard-shell`
and on the shared unit-selector from `teacher-dashboard-text-responses`.

## Why

Assessments (`.../sections/:sectionId/assessments`) is the widest read-only
tab: `apps/src/templates/sectionAssessments/` renders multiple-choice,
match, and free-response tables, per-student submission status, anonymous
surveys, and assessment-feedback download, over `sectionAssessmentsRedux`
and the `/dashboardapi/assessments*` endpoint family (assessments,
section_surveys, section_responses, section_feedback). Cucumber oracles:
`teacher_dashboard_assessments1/2.feature` and
`assessment_feedback_download.feature`. Standard empty-state matrix
(Router:236-249).

## What Changes

- Candidate route `.../sections/:sectionId/assessments` renders the moved
  tab: assessment/survey selector, MC/match/free-response tables with
  submission status, survey results, feedback CSV download.
- The `/dashboardapi/assessments*` endpoint family gains typed wrappers +
  recorded-JSON schemata + MSW handlers; `sectionAssessmentsRedux` moves
  page-scoped with the shell bridge (roster pattern).
- Shell per-tab map flips `assessments` to the candidate route.
- No pixel gate (legacy non-DSCO JSX); behavior, copy, a11y parity; DS
  mapping recorded.

## Capabilities

### New Capabilities

- `teacher-dashboard-assessments-page`: the moved assessments tab — all
  three table kinds, surveys, submission status, feedback download, typed
  data paths, scenarios.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (assessments area), core
  wrappers/mocks, Studio route content, shell map entry. No Rails changes.
