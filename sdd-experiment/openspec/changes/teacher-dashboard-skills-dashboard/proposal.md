# Proposal: teacher-dashboard-skills-dashboard

Position 15 in the migration sequence. Depends on `teacher-dashboard-shell`
(which already provides the flag-gated route and sidebar entry).

## Why

The skills dashboard (`.../sections/:sectionId/skills_in_dev`,
`SkillsDashboard.tsx` in
`apps/src/templates/teacherDashboard/skillsDashboard/`) is a DCDO-gated
(`skills-dashboard`, Router:339) in-development tab. It is part of the V2
surface and MUST port so the flag can be exercised against the candidate;
teachers in the gated rollout must not lose it at cutover.

## What Changes

- Candidate route `.../sections/:sectionId/skills_in_dev` renders the
  ported skills dashboard when DCDO `skills-dashboard` is on; the route
  and sidebar entry are absent when off (shell already specifies the
  gate; this change supplies the content).
- The component's data path is partially PINNED —
  `POST /openai/evaluate_section` (`SkillsDashboard.tsx:11,55`; flagged
  to security review) plus a results read whose URL/shape is
  BLOCKED-EVIDENCE — wrapped in core DashboardApi with capture-gated
  schemata.
- Both flag arms are scenario axes.
- Pixel gate applies (modern TSX surface).

## Capabilities

### New Capabilities

- `teacher-dashboard-skills-dashboard-page`: the ported skills dashboard
  under its DCDO gate — content, data path, scenarios, pixel parity.

### Modified Capabilities

None — the shell's flag-gated route/sidebar entry and per-tab map
anticipate the content landing.

## Impact

- `frontend/packages/teacher-dashboard` (skills area), core
  wrappers/mocks, Studio route content, shell map entry. No Rails changes.
