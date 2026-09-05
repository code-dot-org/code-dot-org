# Design: teacher-dashboard-roster-modernization

## Context

Post-migration state (from teacher-dashboard-manage-students): moved
legacy roster in the package — reactabular table, package-scoped Redux
slice, one-way bridge from shell Query state, typed wrappers + MSW matrix +
re-expressed slice tests + ported Playwright spec. That change recorded the
design-system mapping this change executes.

Sequencing constraint: runs only after the candidate roster is the roster
of record (post-cutover). Before cutover, the roster is pixel-stable
legacy UI by design, and rebuilding it would reopen parity.

## Goals / Non-Goals

**Goals:** one state layer (Query) in the package; design-system roster
UI; legacy dependencies dropped; behavior invariant under the migration's
scenario matrix.

**Non-Goals:** no new roster features; no endpoint changes; no changes to
compliance flows' behavior (age gating, secrets) — only their rendering
components.

## Decisions

- D1. State first, UI second — two phases, separately revertible. Phase 1
  ports the slice to Query mutations/queries behind the existing component
  props (components keep rendering unchanged); phase 2 swaps components.
  Rationale: never debug state and UI regressions in the same diff.
- D2. Table target per the recorded mapping: MUI Table (sticky header,
  sortable columns) with DSCO leaf widgets, matching the design-system
  precedence rule (browser semantics > DSCO > MUI > custom). Inline-edit
  rows use DSCO textField/dropdown — already partially adopted by the
  legacy cells, minimizing visual churn.
- D3. Every compliance-sensitive dialog (age gating, secrets, sharing,
  code review groups) swaps chrome only; its behavior tests from the
  migration run unmodified as the gate.
- D4. Dependency exits are explicit tasks with grep-verified zero-usage
  before removal.

## Risks / Trade-offs

- [Query port subtly changes optimistic/rollback behavior the slice
  encoded (e.g. add-row staging, edit buffering)] → phase-1 gate is the
  re-expressed slice test suite + MSW mutation round-trips; edit-buffer
  semantics get dedicated tests before the port starts.
- [Sortabular column behaviors (sorting stability) differ in MUI] → column
  sort behavior pinned by component tests against the same fixture data
  before/after.
- [A11y uplift accidentally changes semantics a screen reader relied on] →
  a11y review gates on no-regression, not just axe-clean.

## Migration Plan

Phase 1 (state) → stabilize → phase 2 (UI) per component group (table
core, cells, dialogs), each group its own commit train. Rollback per
phase/group.

## Open Questions

- react-csv retention for login export (kept iff the export flow still
  needs client-side CSV after the swap).
- Whether the DSCO table primitives are mature enough at execution time or
  MUI Table carries the whole surface (checked against
  component-library MIGRATION_STATUS.md then).
