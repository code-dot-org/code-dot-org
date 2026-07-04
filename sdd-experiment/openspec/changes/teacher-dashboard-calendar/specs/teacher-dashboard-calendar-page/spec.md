# Spec: teacher-dashboard-calendar-page

## ADDED Requirements

### Requirement: Calendar tab at parity
The candidate route SHALL render the ported unit calendar at
`/frontend-studio/teacher_dashboard/sections/:sectionId/calendar`: weekly
lesson layout for the assigned unit, and the calendar empty state when no
curriculum supports one. The route renders unconditionally (the component,
not the router, decides calendar vs empty state), matching legacy.

#### Scenario: Assigned unit renders its calendar
- **WHEN** the candidate tab renders a section with a calendar-bearing unit
- **THEN** weeks, lesson blocks, and durations match the legacy calendar
  for the same unit

#### Scenario: Empty state
- **WHEN** the section's assignment has no calendar
- **THEN** the calendar empty state renders as legacy (no router-level
  redirect or gate)

### Requirement: Typed data path with recorded contract
The calendar's data request(s) SHALL be confirmed and recorded from a local
Rails run at implementation start, then consumed through typed core
wrappers (schemata tested against recordings) with MSW handlers.

#### Scenario: Contract recorded before schema
- **WHEN** the wrapper schema is authored
- **THEN** it derives from recorded server JSON with parser tests, not from
  memory

### Requirement: Discovery gate and pixel parity
Implementation SHALL begin with behavior-scenario discovery
(`calendar_eyes.feature`, component sources) exposed as visible dev-shell
choices (floor: calendar-bearing unit, empty state, error), and SHALL
capture pixel baselines/checkpoints via the shell harness for the populated
calendar and the empty state (DSCO-era TSX surface) at
`http://localhost-studio.code.org:9000` with serving-checkout validated;
Playwright MCP MAY be used during implementation.

#### Scenario: Calendar pixel diff
- **WHEN** the harness compares the populated calendar with declared masks
- **THEN** the region-scoped diff is within threshold or fails with the
  diff image attached
