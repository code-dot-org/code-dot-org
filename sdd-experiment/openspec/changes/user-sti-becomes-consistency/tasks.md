# Tasks: user-sti-becomes-consistency

## 1. Pin current behavior

- [ ] 1.1 Characterization tests in
      dashboard/test/lib/services/user/upgrade_to_teacher_test.rb and
      downgrade_to_student_test.rb: pin current return values (user /
      true / false; boolean) and that today the in-memory class does NOT
      match `user_type` after a successful call (to be flipped in 3.1)
- [ ] 1.2 Audit the four call sites (lti_v1_controller.rb:427,
      pd/session_attendance_controller.rb:62,:87,
      pd/workshop_enrollment_controller.rb:92,
      registrations_controller.rb:397 via UserTypeSetter) for any
      class-sensitive use of the user after the call; record findings

## 2. Fix

- [ ] 2.1 UpgradeToTeacher: return the correctly-classed user on both
      the no-op path and the success path, guarded per design D1
      (`user.instance_of?(Teacher) ? user : user.becomes!(Teacher)`);
      failure paths still return `false` with errors on the passed user
- [ ] 2.2 DowngradeToStudent: same shape — reclass to Student after a
      successful `update`, return `false` on failure
- [ ] 2.3 UserTypeSetter: confirm passthrough needs no edit
- [ ] 2.4 Update any call site found class-sensitive in 1.2 to use the
      returned object (expected: none)

## 3. Tests

- [ ] 3.1 Flip the 1.1 pins: after upgrade/downgrade,
      `returned.class == User.find_sti_class(returned.user_type)` and
      the row persists the new type
- [ ] 3.2 Failure test: invalid save returns `false` and the passed-in
      user carries the errors (registrations_controller contract)
- [ ] 3.3 user_type_setter_test.rb: return value passes through for
      both directions

## 4. Verify

- [ ] 4.1 `bundle exec spring testunit
      test/lib/services/user/upgrade_to_teacher_test.rb
      test/lib/services/user/downgrade_to_student_test.rb
      test/lib/services/user/user_type_setter_test.rb` (from dashboard/)
- [ ] 4.2 `./tools/hooks/pre-commit` clean
