# account-settings-resilience

## ADDED Requirements

### Requirement: Refetch failure does not discard edits

The page SHALL render the blocking error state (message + "Try again") only
when a query is in error with no cached data. When settings data exists, a
failed refetch SHALL leave the form mounted with all field and SaveBar state
intact, surfacing the failure non-destructively.

#### Scenario: First load fails

- **WHEN** the initial settings or current-user request fails
- **THEN** the page shows the blocking error with a "Try again" button and no
  form

#### Scenario: Background refetch fails after load

- **WHEN** settings have loaded, the user has dirty edits, and a subsequent
  refetch (e.g. post-mutation invalidation) fails
- **THEN** the form remains mounted with the dirty edits preserved

### Requirement: Delete-account gate enforced in the submit handler

The delete-account submit action SHALL verify the acknowledgment gate
(checkbox, or all five acknowledgments plus the verification string for a
teacher with dependent students) and that no delete request is already in
flight, and SHALL do nothing when the gate is unsatisfied — independent of
the submit button's disabled state.

#### Scenario: Submit fires with the gate unsatisfied

- **WHEN** the delete form's submit event fires while acknowledgments are
  incomplete
- **THEN** no DELETE request is sent

### Requirement: Modal submits are re-entrancy safe

The shared modal-form submit wrapper SHALL ignore a submit that arrives while
a previous submit's action is still in flight.

#### Scenario: Double submit

- **WHEN** a modal form's submit event fires twice before the first action
  settles
- **THEN** the action runs once

### Requirement: Document title is scoped to the page

The page SHALL set the document title on mount and restore the previous title
on unmount.

#### Scenario: Navigating away in the SPA host

- **WHEN** the host unmounts the page and renders another route
- **THEN** the document title no longer reads "My Account — Code.org"
