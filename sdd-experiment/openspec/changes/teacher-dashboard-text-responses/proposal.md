# Proposal: teacher-dashboard-text-responses

Position 8 in the migration sequence. Depends on `teacher-dashboard-shell`.

## Why

Text responses (`.../sections/:sectionId/text_responses`) is a single-table
read-only tab: `TextResponses.jsx`, `TextResponsesTable.jsx`,
`TextResponsesLessonSelector.jsx` over `textReponsesDataApi.js`
(`apps/src/templates/textResponses/`), listing students' free-text answers
per unit with a lesson selector, backed by
`GET /dashboardapi/section_text_responses/:id`. Standard empty-state matrix
(no-students + no-curriculum, Router:226-235).

## What Changes

- Candidate route `.../sections/:sectionId/text_responses` renders the
  moved tab: unit-scoped response table, lesson selector, response links to
  the student's work, empty-state matrix.
- `GET /dashboardapi/section_text_responses/:id` gains a typed wrapper +
  recorded-JSON schema + MSW handler; the data-api module moves with the
  transport adapter.
- Shell per-tab map flips `text_responses` to the candidate route.
- No pixel gate (legacy non-DSCO JSX); behavior, copy, a11y parity; DS
  mapping recorded.

## Capabilities

### New Capabilities

- `teacher-dashboard-text-responses-page`: the moved text-responses tab —
  table, lesson selector, typed data path, scenarios.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (text-responses area), core
  wrappers/mocks, Studio route content, shell map entry. No Rails changes.
