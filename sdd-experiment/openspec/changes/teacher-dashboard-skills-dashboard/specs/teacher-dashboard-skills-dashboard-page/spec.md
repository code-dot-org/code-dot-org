# Spec: teacher-dashboard-skills-dashboard-page

## ADDED Requirements

### Requirement: Skills dashboard under its DCDO gate
The candidate route SHALL render the ported skills dashboard at
`/frontend-studio/teacher_dashboard/sections/:sectionId/skills_in_dev`
when DCDO `skills-dashboard` is on, at behavior/copy parity with the
legacy component for the same data; when the flag is off the route and
sidebar entry are absent (shell gate). Both arms are scenario axes.

#### Scenario: Flag on
- **WHEN** the flag is on and the tab renders for a seeded section
- **THEN** content matches the legacy tab for the same data

#### Scenario: Flag off
- **WHEN** the flag is off
- **THEN** neither sidebar entry nor route exists, as legacy

### Requirement: Recorded data path, discovery, pixel parity
The component's data SHALL be consumed through typed DashboardApi
wrappers in `core/src/api/dashboard/...` for the pinned
`POST /openai/evaluate_section` (`SkillsDashboard.tsx:11,55` — flag the
`/openai/*` route to security review with the CanCan scoping check) and
its results read (`HttpClient.fetchJson<SkillsResponse>` at :69;
BLOCKED-EVIDENCE: read the fetch site + one runtime capture for URL and
shape), with default MSW handlers in core. The feature owns scenario
fixtures only; its entry lazy-loads outside the shell chunk.
Desktop/laptop responsiveness applies (no overlap at 200% zoom / narrow
laptop; tablet/mobile parity NOT required). The move copies at a recorded legacy SHA with a divergence
ledger entry (the legacy component is under active development).
Implementation begins with scenario discovery from the component source,
exposed as visible dev-shell choices (floor: flag-on populated, flag-off,
error). Pixel baselines/checkpoints are captured via the shell harness
(modern TSX surface) at `http://localhost-studio.code.org:9000` with
serving-checkout validated; Playwright MCP MAY be used during
implementation.

#### Scenario: Divergence tracked
- **WHEN** the legacy component changes after the recorded SHA
- **THEN** the ledger entry surfaces the divergence for re-port before
  cutover
