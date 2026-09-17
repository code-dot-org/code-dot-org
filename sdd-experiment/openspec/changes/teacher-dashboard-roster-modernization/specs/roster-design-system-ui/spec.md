# Spec: roster-design-system-ui

## ADDED Requirements

### Requirement: Roster runs on one state layer
The roster SHALL use TanStack Query and local component state exclusively;
the package-scoped Redux store and the shell-state bridge introduced by the
migration are removed. The typed wrappers, recorded fixtures, and MSW
scenario matrix from the migration are reused unchanged as the behavior
gate.

#### Scenario: Slice behaviors preserved
- **WHEN** the migration's re-expressed slice test suite and MSW mutation
  round-trips run against the Query implementation
- **THEN** all pass, including edit-buffering, add-row staging, and
  section-switch-mid-edit behaviors

### Requirement: Roster UI is design-system based
The roster table and dialogs SHALL render on design-system components per
the recorded mapping — MUI Table with sticky header and pinned sort
behavior, MUI Button, DSCO textField/dropdown inline editors, DSCO tooltip,
DSCO dialog chrome, DSCO fontAwesomeV6Icon — and the legacy dependencies
(reactabular-table, sortabular, react-tooltip) SHALL be removed from the
package with grep-verified zero usage.

#### Scenario: Behavior matrix invariant under the swap
- **WHEN** the migration's discovered scenario matrix (six login types,
  age-gated, at-capacity, restricted, empty, transfers, code review groups,
  sharing) runs against the swapped UI
- **THEN** every scenario passes and the ported Playwright spec stays green
  without weakened assertions

#### Scenario: Compliance dialogs change chrome only
- **WHEN** age-gating, secret, sharing, and code-review-groups dialogs are
  swapped to DSCO chrome
- **THEN** their behavior tests from the migration run unmodified and pass

### Requirement: A11y uplift without semantic regression
The component swap SHALL improve accessibility (proper table semantics,
labeled controls, keyboard operability) and MUST NOT regress any existing
semantics; the gate is a no-regression a11y review plus axe-clean per
scenario, not axe alone.

#### Scenario: Keyboard-complete roster
- **WHEN** a teacher operates the modernized roster by keyboard only
- **THEN** every flow the behavior matrix covers (add, edit, save, remove,
  dialogs) is completable, and screen-reader row/column context is
  announced per table semantics
