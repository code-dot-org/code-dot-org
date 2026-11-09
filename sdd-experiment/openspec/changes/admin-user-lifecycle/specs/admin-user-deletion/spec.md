# admin-user-deletion

## ADDED Requirements

### Requirement: Sudo-gated user delete and undelete
The system SHALL expose admin-gated endpoints to soft-delete and
undelete a user, both requiring fresh sudo (require_sudo!) and both
creating AdminAuditEvent rows with affected_user_id and the optional
reason.

#### Scenario: Delete without fresh sudo
- **WHEN** an admin with a stale sudo stamp calls delete
- **THEN** the response is 403 sudo_required and the user is unchanged

#### Scenario: Delete with fresh sudo
- **WHEN** an admin with a fresh sudo stamp deletes a user with a reason
- **THEN** the user is soft-deleted and the audit row records actor,
  user, and reason

#### Scenario: Undelete restores
- **WHEN** an admin with fresh sudo undeletes a soft-deleted user
- **THEN** the account is restored and audited

### Requirement: Section undelete
The system SHALL expose an admin-gated, audited endpoint to restore a
soft-deleted section (no sudo required), replacing
admin_search#undelete_section.

#### Scenario: Undelete a section
- **WHEN** an admin undeletes a section found via section lookup
- **THEN** the section is restored, enrollments intact per legacy
  semantics, and the action is audited

### Requirement: Destructive SPA flows require typed confirmation
The admin SPA SHALL require retyping the target's identifier before
submitting sudo-tier actions, and SHALL handle 403 sudo_required by
launching the re-auth flow and retrying after success.

#### Scenario: Confirmation mismatch
- **WHEN** the typed identifier does not match the target
- **THEN** the submit control stays disabled and no request is sent

#### Scenario: Sudo expired mid-flow
- **WHEN** the API returns sudo_required
- **THEN** the SPA prompts re-auth and repeats the action after the
  stamp refreshes
