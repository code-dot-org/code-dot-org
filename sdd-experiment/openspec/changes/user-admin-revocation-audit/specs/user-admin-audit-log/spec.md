# Spec: user-admin-audit-log

## ADDED Requirements

### Requirement: Admin transitions are audited on every path
Every transition of a user's admin bit SHALL emit an audit message to the
security channel, regardless of which code path performs the write. In
particular, `revoke_all_permissions` MUST NOT bypass the audit hook.

#### Scenario: Revoking all permissions from an admin
- **WHEN** `revoke_all_permissions` is called on a user with `admin: true`
- **THEN** the admin bit is cleared, all UserPermission rows are removed,
  and exactly one Revoking-ADMIN audit message is emitted

#### Scenario: Revoking permissions from a non-admin
- **WHEN** `revoke_all_permissions` is called on a user with no admin bit
- **THEN** permissions are removed and no admin audit message is emitted

#### Scenario: Granting admin (existing behavior preserved)
- **WHEN** a user is saved with `admin` changing from nil/false to true
- **THEN** a Granting-ADMIN audit message is emitted, as today
