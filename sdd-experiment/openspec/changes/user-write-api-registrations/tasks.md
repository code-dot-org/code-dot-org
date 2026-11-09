# Tasks: user-write-api-registrations

Depends on user-write-api-foundation + user-write-api-catalog. One
endpoint per PR, pins first.

## 0. Blocking asks (resolve before any extraction)

- [ ] 0.1 **DECISION (blocking, security)**: update_params permits
      `:provider` and `:encrypted_password` from user input
      (registrations_controller.rb:591/:579). Verify whether
      `forbidden_change?` (:532) or model validations actually block
      them; if unmitigated this is a live mass-assignment finding to
      fix out-of-band immediately. Ruling needed: drop both from the
      permit list (default, per design D2a) or document why either is
      required. Owner: security + a registrations code owner.

## 1. Pins

- [ ] 1.1 Shared matrix fixtures (student/teacher × migrated/sponsored/
      manual × password-present/absent) via existing factories
- [ ] 1.2 Characterization suites for set_parent_email,
      set_student_information, update_user_email, update, upgrade,
      destroy, set_user_type (audit existing set_user_type_test.rb and
      registrations_controller_test.rb coverage first; fill gaps only)

## 2. Commands

- [ ] 2.1 UpdateParentEmail; delegate set_parent_email
- [ ] 2.2 UpdateAgeAndState (+UpdateName slice); delegate
      set_student_information
- [ ] 2.3 UpdateEmail (three arms verbatim); delegate update_user_email
- [ ] 2.4 UpdateName/UpdatePassword/UpdateDemographics; decompose update
      per design D2
- [ ] 2.5 SoftDelete; delegate destroy/destroy_users
- [ ] 2.6 SetUserType wrapper; delegate set_user_type; user_type removed
      from permit list

## 3. Verify

- [ ] 3.1 Pin suites pass unchanged per endpoint
      (`bundle exec spring testunit`, targeted files)
- [ ] 3.2 Cop todo list shrinks by this controller; `./tools/hooks/pre-commit`
      clean
- [ ] 3.3 Manual pass through /users/edit flows on a dev server (all
      account shapes)
