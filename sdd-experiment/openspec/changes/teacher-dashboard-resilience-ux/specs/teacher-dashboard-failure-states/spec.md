# Spec: teacher-dashboard-failure-states

## ADDED Requirements

### Requirement: Data failures are visible and retriable
Candidate teacher-dashboard surfaces SHALL render a visible, retriable
error state when a data query fails (section list, selected section, home
scalars, roster students): a message plus a retry action that re-runs the
failed query. Errors MUST NOT be swallowed into console logging, and a
failed load MUST NOT leave blank or stale-without-indication UI.

#### Scenario: Bootstrap failure
- **WHEN** the sections bootstrap request fails (MSW `error` scenario)
- **THEN** the shell renders the error state with retry, and retry after
  the fault clears loads the dashboard

#### Scenario: Roster load failure
- **WHEN** the students request fails on the candidate roster
- **THEN** the roster region shows the error state with retry instead of an
  empty table

### Requirement: Loading states are skeletons, masked in parity runs
Candidate surfaces SHALL show loading skeletons while section list,
selected-section chrome, and roster table queries resolve. Skeleton and
error frames SHALL be masked or excluded in visual-parity comparisons, and
each such deviation SHALL be recorded in the owning feature's scenario
list.

#### Scenario: Skeleton not diffed against legacy
- **WHEN** a parity capture runs on a surface that can show a skeleton
- **THEN** the comparison either waits for settled state or masks the
  skeleton region; an unmasked skeleton frame fails the run

### Requirement: Access-denied redirects carry a message
The candidate SHALL show an explanatory message at the destination when its
auth gate redirects a teacher away from a section route they cannot access.
The redirect mechanics remain as specified by the shell; the visible copy
ships only after a recorded product ruling.

#### Scenario: Non-instructor bounce
- **WHEN** a teacher is redirected off a section they no longer instruct
- **THEN** the landing page shows a message explaining the redirect (copy
  per product ruling), rather than a silent landing
