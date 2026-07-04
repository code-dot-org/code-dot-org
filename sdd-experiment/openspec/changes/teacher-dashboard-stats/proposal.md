# Proposal: teacher-dashboard-stats

Position 4 in the migration sequence (after shell, homepage v2,
manage students). Depends on `teacher-dashboard-shell`.

## Why

Stats (`/teacher_dashboard/sections/:sectionId/stats`) is the smallest
read-only tab: `StatsTableWithData.jsx` + `StatsTable.jsx` over
`statsRedux.js` (`apps/src/templates/teacherDashboard/`), with a
participant-type branch for PL sections and the standard empty-state matrix
(no-students + no-curriculum). Sequencing it first among the tabs proves
the per-tab pipeline — typed wrappers, MSW scenarios, move-with-adapters,
empty-state gating — at minimal risk before the bigger tabs consume it.

## What Changes

- Candidate route `.../sections/:sectionId/stats` renders the moved stats
  table (completed levels, total lines of code per student) inside the
  shell, with legacy empty states: no-students when `studentCount == 0`,
  no-curriculum when no student has progress.
- PL-section variant: the participant-type branch renders as legacy for
  professional-learning sections.
- Legacy `statsRedux` data path moves with adapters (legacy JSX,
  move-not-rewrite); its endpoint is confirmed and recorded at
  implementation start, then wrapped (typed schema + MSW handler).
- Shell per-tab map flips `stats` to the candidate route.
- No pixel gate: legacy non-DSCO JSX table. Behavior, copy, and a11y
  parity; design-system mapping recorded for the later modernization pass.

## Capabilities

### New Capabilities

- `teacher-dashboard-stats-page`: the moved stats tab — table, PL branch,
  empty states, typed data path, MSW scenarios.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip (map is data).

## Impact

- `frontend/packages/teacher-dashboard` (stats area), core wrappers/mocks,
  Studio route content, shell map entry. No Rails changes.
