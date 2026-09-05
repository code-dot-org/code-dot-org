# admin-progress-tools

## ADDED Requirements

### Requirement: Delete progress with reason, sudo-gated
The system SHALL expose an admin-gated endpoint deleting a user's
progress for a given script, requiring fresh sudo and a reason
parameter, audited with script id and reason (parity with the legacy
delete_progress including its log_admin_action fields).

#### Scenario: Delete progress
- **WHEN** an admin with fresh sudo deletes a user's script progress
  with a reason
- **THEN** the progress is removed and the audit row carries script_id
  and reason

#### Scenario: Missing reason
- **WHEN** the reason parameter is blank
- **THEN** the response is 422 with a per-field error and nothing is
  deleted

### Requirement: Manual pass
The system SHALL expose an admin-gated, audited endpoint marking a
script level passed for a user, replacing admin_users#manual_pass (no
sudo; additive).

#### Scenario: Mark passed
- **WHEN** an admin submits user, script, and level identifiers
- **THEN** the level is marked passed exactly as the legacy tool does
  and the action is audited

### Requirement: Account repair
The system SHALL expose an admin-gated, audited endpoint running the
legacy account_repair operation for a malformed teacher account,
returning a JSON summary of repairs performed.

#### Scenario: Repair run
- **WHEN** an admin triggers repair on an affected account
- **THEN** the same repairs as the legacy tool are applied and the
  response summarizes them
