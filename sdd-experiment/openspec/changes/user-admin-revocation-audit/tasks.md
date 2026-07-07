# Tasks: user-admin-revocation-audit

## 1. Pin current behavior

- [ ] 1.1 Characterization test: `revoke_all_permissions` on an admin user
      clears admin + permissions (current behavior, no audit asserted yet)
- [ ] 1.2 Verify why `update_column` was used (git blame; check for
      validation-dirty legacy rows in the calling paths)
- [ ] 1.3 **DECISION (blocking, before 2.1)**: `update!(admin: nil)`
      raises on validation-dirty legacy rows where `update_column`
      silently succeeded. Choose: accept raising in admin tooling
      (default — surfaces bad rows) or use the D1 fallback
      `self.admin = nil; save!(validate: false)` (still fires the audit
      callback, tolerates dirty rows). Informed by 1.2's findings.
      Owner: admin-tools code owner.

## 2. Fix

- [ ] 2.1 Replace `update_column(:admin, nil)` with `update!(admin: nil)`
      (or `save!(validate: false)` per design D1 fallback) in
      `user_permission_grantee.rb`
- [ ] 2.2 Add test: revoke on admin emits exactly one Revoking-ADMIN
      ChatClient message (stubbed); revoke on non-admin emits none

## 3. Verify

- [ ] 3.1 `bundle exec spring testunit test/models/concerns/user_permission_grantee_test.rb`
- [ ] 3.2 `./tools/hooks/pre-commit` clean
