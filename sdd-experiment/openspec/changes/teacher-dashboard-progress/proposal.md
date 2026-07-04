# Proposal: teacher-dashboard-progress

Position 13 in the migration sequence — deliberately last among the core
tabs. Depends on `teacher-dashboard-shell` and on
`teacher-dashboard-course-unit-overview` (shared scoped progress store
module).

## Why

Progress (`.../sections/:sectionId/progress`) is the deepest tab:
`apps/src/templates/sectionProgressV2/` (24 unit-test files) renders the
unit selector, the lesson/level progress grid with expanded columns, the
floating header and floating scrollbar, view-as-student, the more-details
dialog, the teacher panel, lesson lock, teacher scores, and CSV download,
over three interlocking redux slices (`progressRedux`, `sectionProgress`,
`unitSelection`) and the endpoints
`/dashboardapi/section_level_progress/:id`, script structure, unit
summary, and `/dashboardapi/v1/teacher_scores`. It is wrapped by
`GlobalEditionWrapper` (componentId SectionProgressV2, Router:210-225) and
gated by the standard empty-state matrix. Sequencing it after every other
tab lets it land on a proven pipeline and reuse the overview change's
store module.

## What Changes

- Candidate route `.../sections/:sectionId/progress` renders the moved
  progress experience in sub-splits: (a) read-only grid (unit selector,
  lesson/level columns, expanded views, icon key, CSV download); then (b)
  floating header/scrollbar; then (c) teacher panel, lesson lock, teacher
  scores, view-as, more-details dialog.
- The three slices move page-scoped (reusing the overview change's store
  module for progressRedux; adding sectionProgress + unitSelection
  integration) with the shell bridge; every endpoint gains typed wrappers
  + recorded-JSON schemata + MSW handlers.
- Global Edition parity: the candidate reproduces the
  `GlobalEditionWrapper` gating for SectionProgressV2 (region-hidden
  behavior per `<html data-ge-region>`), with the existing
  `fa-teacher-dashboard.spec.ts` Playwright spec as the oracle.
- Shell per-tab map flips `progress` to the candidate route — including
  the shell's own default-redirect target (bare section → progress).
- No pixel gate (legacy JSX grid); behavior, copy, a11y parity; explicit
  DS mapping recorded; performance non-regression is a named gate
  (realistic class sizes — the grid is the heaviest render surface).

## Capabilities

### New Capabilities

- `teacher-dashboard-progress-page`: the moved progress tab — grid,
  floating chrome, teacher panel, lock, scores, view-as, dialog, GE
  gating, typed data paths, scenarios, performance gate.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip (the bare-section
redirect target flips with the same map entry).

## Impact

- `frontend/packages/teacher-dashboard` (progress area), core
  wrappers/mocks, Studio route content, shell map entry, e2e parity specs
  (`teacher_dashboard_progress_v2.feature` incl. @eyes scenarios and
  `fa-teacher-dashboard.spec.ts` are oracles). No Rails changes.
