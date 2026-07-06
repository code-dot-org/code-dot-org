# Tasks: user-admin-revocation-audit

## 1. Pin current behavior

- [ ] 1.1 Characterization test: `revoke_all_permissions` on an admin user
      clears admin + permissions (current behavior, no audit asserted yet)
- [ ] 1.2 Verify why `update_column` was used (git blame; check for
      validation-dirty legacy rows in the calling paths)

## 2. Fix

- [ ] 2.1 Replace `update_column(:admin, nil)` with `update!(admin: nil)`
      (or `save!(validate: false)` per design D1 fallback) in
      `user_permission_grantee.rb`
- [ ] 2.2 Add test: revoke on admin emits exactly one Revoking-ADMIN
      ChatClient message (stubbed); revoke on non-admin emits none

## 3. Verify

- [ ] 3.1 `bundle exec spring testunit test/models/concerns/user_permission_grantee_test.rb`
- [ ] 3.2 `./tools/hooks/pre-commit` clean
