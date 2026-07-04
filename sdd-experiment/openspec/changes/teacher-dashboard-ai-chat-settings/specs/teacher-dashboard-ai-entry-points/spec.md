# Spec: teacher-dashboard-ai-entry-points

## ADDED Requirements

### Requirement: ai_chat_settings tab at parity
The candidate route SHALL render the ported AI chat access controls at
`/frontend-studio/teacher_dashboard/sections/:sectionId/ai_chat_settings`:
per-student access levels, section-level controls, and mutations through
the recorded legacy endpoints. Without a selected section the route
redirects (replace) to progress, as legacy.

#### Scenario: Access controls render and mutate
- **WHEN** a teacher changes a student's AI chat access level on the
  candidate tab
- **THEN** the change persists via the legacy endpoint and re-renders as
  legacy

#### Scenario: Guard redirect
- **WHEN** the route is opened with no selected section available
- **THEN** the teacher lands on progress via replace navigation

### Requirement: AI-differentiation FAB under its gates
The candidate shell SHALL show the AI-differentiation chat FAB when AND
only when experiment `ai-differentiation` is enabled and
`aiDifferentiationEnabled` is set, reusing the existing implementation
(entry point, not a rebuild). Both arms of each gate are scenario axes.

#### Scenario: FAB gated on
- **WHEN** both gates are set in a scenario
- **THEN** the FAB renders and opens the differentiation chat as legacy

#### Scenario: FAB gated off
- **WHEN** either gate is unset
- **THEN** no FAB renders

### Requirement: Data paths, discovery, pixel parity
The access-level endpoints SHALL be recorded and consumed through typed
wrappers with MSW handlers (auth scenarios included: non-owner cannot
mutate). Implementation begins with behavior-scenario discovery (aichat
access-controls tests and sources) exposed as visible dev-shell choices
(floor: populated, guard-redirect, gates-on/off matrix, mutation-error).
The access-controls tab is a modern DSCO/TSX surface: pixel
baselines/checkpoints captured via the shell harness at
`http://localhost-studio.code.org:9000` (serving-checkout validated;
Playwright MCP available during implementation).

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector
