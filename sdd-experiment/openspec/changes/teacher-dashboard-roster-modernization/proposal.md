# Proposal: teacher-dashboard-roster-modernization

Improvement change (not a parity/migration change). Derived from the
adversarial review of the migration context gathered 2026-07-04.

## Why

The manage-students migration deliberately moves the roster as-is: a
reactabular-table UI over a package-encapsulated Redux slice bridged to the
shell's TanStack Query state. The adversarial pass flagged the honest cost
of that decision: after it lands, `@code-dot-org/teacher-dashboard`
permanently carries two state layers (Query for shell/homepage, bridged
Redux for roster), a deprecated table library (reactabular-table +
sortabular, unmaintained upstream), and non-design-system UI — unless the
convergence is scheduled as a real change. This is that change. It is
gated on the migration being done and stable, and it consumes the
design-system mapping and the behavior-scenario matrix the migration
records, so it starts from a plan and a test bed, not a survey.

## What Changes

- Port `manageStudentsRedux` behaviors to TanStack Query + local state,
  deleting the bridge and the package-scoped store. The migration's
  re-expressed slice tests and MSW scenario matrix are the behavior gate.
- Replace the reactabular table with the design-system target recorded by
  the migration: DSCO/MUI table with sticky header, MUI Button, DSCO
  textField/dropdown inline editors, DSCO tooltip (replacing
  react-tooltip), DSCO dialog chrome for the hand-rolled dialogs. Icons
  stay DSCO fontAwesomeV6Icon.
- Drop the inherited legacy dependencies from the package
  (reactabular-table, sortabular, react-tooltip; react-csv reviewed —
  kept only if the export flow still needs it).
- A11y uplift comes with the component swap (proper table semantics,
  labeled controls) — allowed by the program as long as semantics do not
  regress.
- Behavior does not change: the migration's discovered scenario matrix
  (six login types, age-gated, at-capacity, restricted, transfers, code
  review groups, sharing) passes before and after, and the ported
  Playwright spec stays green without weakened assertions.

## Capabilities

### New Capabilities

- `roster-design-system-ui`: the roster on design-system components and
  Query state, behavior-equivalent to the migrated legacy implementation.

### Modified Capabilities

- `teacher-dashboard-roster-data`: the package-encapsulated Redux store and
  one-way bridge requirement is retired; roster server state moves to
  TanStack Query with the same typed wrappers and MSW fixtures.

## Impact

- `frontend/packages/teacher-dashboard` roster area (UI + state);
  dependency removals from the package manifest.
- No Rails changes; typed wrappers, recorded fixtures, and MSW scenarios
  from the migration are reused unchanged.
- Visual appearance will intentionally change (design-system components);
  this is the point — the roster exits parity constraints after cutover,
  and this change runs only post-cutover per sequencing below.
