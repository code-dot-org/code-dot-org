# Proposal: teacher-dashboard-resilience-ux

Improvement change (not a parity/migration change). Derived from the
adversarial review of the migration context gathered 2026-07-04.

## Why

Strict parity would reproduce failure-handling the legacy dashboard gets
wrong. Evidence read this session:

1. Selected-section load failure is swallowed:
   `apps/src/templates/teacherNavigation/selectedSectionLoader.ts:52-56`
   catches the fetch error and `console.log`s it — the teacher gets a
   blank or stale page with no recourse.
2. While section data resolves, legacy renders blank/partial UI (no
   loading affordance in the shell chrome path).
3. The legacy CanCan rescue silently rewrites teacher URLs onto public
   pages (`params[:path]` `unit`→`s` branch,
   `teacher_dashboard_controller.rb:8-19`) with no message — a teacher who
   loses access to a section lands somewhere unexplained.

The migration program has already pre-approved intentional deviations for
error pages and loading skeletons, conditional on: each deviation recorded
per scenario, and loading/error frames masked or excluded from pixel
diffs. This change is the concrete spec for those deviations in the
candidate shell/homepage/roster.

## What Changes

- Candidate section-load failures render a retriable error state (message +
  retry action that re-runs the failed query), never a silent blank. Errors
  surface through the typed client, not console logging.
- Candidate shell/homepage/roster show loading skeletons for the section
  list, selected-section chrome, and roster table while queries resolve.
- When the candidate's auth gate bounces a teacher off a section route
  (non-instructor), the destination shows an explanatory message
  (flash/toast) instead of a silent landing. Visible copy — requires a
  product ruling before implementation; the mechanism ships behind that
  ruling.
- Each deviation is recorded in the owning feature's scenario list, and
  its frames are masked/excluded in the visual-parity harness runs.

## Capabilities

### New Capabilities

- `teacher-dashboard-failure-states`: retriable error states, loading
  skeletons, and access-denied messaging for the candidate teacher
  dashboard, with per-scenario deviation records and pixel-diff masking
  rules.

### Modified Capabilities

None — the migration specs' pixel-parity requirements already carve out
recorded, masked deviations; this change fills that carve-out rather than
altering it.

## Impact

- `frontend/packages/teacher-dashboard` (error/skeleton components, query
  error wiring), `frontend/packages/e2e-tests` (mask declarations),
  MSW `error` scenarios (already required by the migration specs).
- No Rails changes. Depends on the shell change; homepage/roster adopt as
  they land.
