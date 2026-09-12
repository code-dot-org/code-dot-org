# Tasks: user-write-api-foundation

## 1. Pin current behavior

- [ ] 1.1 Characterization tests for all 18 preference endpoints in
      dashboard/test/controllers/api/v1/users_controller_test.rb:
      status, response body, persisted attribute value, and the
      unauthorized path for each (extend the existing 31 tests; do not
      modify them)
- [ ] 1.2 Enumerate current cop violations: run the draft cop with
      `bundle exec rubocop --only CustomCops/UserMutationOutsideService
      dashboard/app/controllers` and capture the offender file list

## 2. Command and instrumentation

- [ ] 2.1 dashboard/lib/services/user/update_preferences.rb: frozen
      17-attribute allowlist (design D2), `call` (save) and `call!`
      (save!), ArgumentError on unknown key before assignment
- [ ] 2.2 dashboard/lib/services/user/instrumentation.rb: prepend
      module, one Cdo::Metrics count per invocation (design D4);
      prepend into UpdatePreferences only
- [ ] 2.3 Unit tests in
      dashboard/test/lib/services/user/update_preferences_test.rb:
      allowlisted write, rejected key, save vs save! semantics, exactly
      one metric emitted (stub Cdo::Metrics), exception propagation

## 3. Delegate the controller

- [ ] 3.1 Replace the assign-then-save body of each of the 18 actions
      in api/v1/users_controller.rb with an UpdatePreferences call
      (`call` for the 12 lenient actions, `call!` for the 6 raising
      ones); param parsing and render/head lines stay put
- [ ] 3.2 Characterization tests from 1.1 pass unmodified

## 4. Cop

- [ ] 4.1 tools/customLinters/rubocop_user_mutation_outside_service.rb
      per design D3 (model on rubocop_dashboard_db_usage.rb)
- [ ] 4.2 Require it from .config/rubocop/config.yml; add the offender
      Exclude list from 1.2 to .config/rubocop/todo.yml
- [ ] 4.3 Verify: cop flags a fixture violation in a non-excluded
      controller; silent on dashboard/lib/services/user/; after task 3,
      api/v1/users_controller.rb drops off the Exclude list

## 5. Verify

- [ ] 5.1 `bundle exec spring testunit
      test/lib/services/user/update_preferences_test.rb` and
      `test/controllers/api/v1/users_controller_test.rb` green
- [ ] 5.2 `bundle exec rubocop --only
      CustomCops/UserMutationOutsideService dashboard/app/controllers`
      reports zero offenses outside the todo Excludes
- [ ] 5.3 `./tools/hooks/pre-commit` clean
