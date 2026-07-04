# Proposal: teacher-dashboard-calendar

Position 7 in the migration sequence. Depends on `teacher-dashboard-shell`.

## Why

Calendar (`.../sections/:sectionId/calendar`) is a small read-only tab:
`UnitCalendar.tsx` + `CalendarEmptyState.tsx`
(`apps/src/templates/teacherNavigation/`), rendering the assigned unit's
weekly lesson layout. It renders unconditionally (no empty-state gate in
the router — the component itself decides between calendar and its empty
state). TSX/DSCO-era surface with an existing visual oracle
(`calendar_eyes.feature`).

## What Changes

- Candidate route `.../sections/:sectionId/calendar` renders the ported
  unit calendar, including the empty state when no curriculum supports a
  calendar.
- The calendar's data source is confirmed and recorded at implementation
  start (unit/script structure payload), then wrapped (typed schema + MSW).
- Shell per-tab map flips `calendar` to the candidate route.
- Pixel gate applies (TSX/DSCO-era surface; `calendar_eyes.feature` is the
  legacy visual oracle).

## Capabilities

### New Capabilities

- `teacher-dashboard-calendar-page`: the ported calendar tab with typed
  data path, scenarios, and pixel parity.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (calendar area), core
  wrappers/mocks, Studio route content, shell map entry, e2e parity specs.
  No Rails changes.
