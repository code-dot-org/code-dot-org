# Proposal: user-admin-revocation-audit

Defect fix from the User Model Improvement Report (July 2026), Addendum 1
finding A2 (verified against source). Independent of all other user-model
changes; no ordering constraints. Zero user-visible impact.

## Why

Admin privilege *grants* are audited: `UserPermissionGrantee` registers
`before_save :log_admin_save` (dashboard/app/models/concerns/
user_permission_grantee.rb:12), which posts grant/revoke messages to the
`infra-security` channel. But `revoke_all_permissions` — the
security-sensitive de-escalation path — strips admin with
`update_column(:admin, nil)` (user_permission_grantee.rb:44), which skips
callbacks entirely. Result: an admin's privileges can be revoked with no
audit trail, while every grant is logged. The asymmetry is exactly
backwards for a security log.

## What Changes

- `revoke_all_permissions` stops bypassing the audit hook: replace
  `update_column(:admin, nil)` with an update path that fires
  `log_admin_save` (e.g. `update!(admin: nil)`), or log explicitly before
  the column write if callback side effects are undesirable — decided in
  design after checking why `update_column` was chosen.
- A regression test pins that revoking all permissions from an admin user
  produces the audit log message.
- No behavior change for non-admin permission revocation (UserPermission
  rows are already destroyed via callbacks-honoring `destroy`).

## Capabilities

### New Capabilities

- `user-admin-audit-log`: every admin-bit transition (grant and revoke, by
  any code path) emits an audit record to the security channel.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/app/models/concerns/user_permission_grantee.rb` (one method).
- New test in `dashboard/test/models/concerns/` pinning audit emission.
- No schema change, no user-facing change, no API change.
