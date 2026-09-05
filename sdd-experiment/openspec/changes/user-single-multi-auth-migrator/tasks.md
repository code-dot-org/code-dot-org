# Tasks: user-single-multi-auth-migrator

## 0. Blocking asks

- [ ] 0.1 **DECISION (blocking, before 2.1)**: ratify design D3 — the
      unified migrator drops the service's Clever `version = 'v3'`
      assignment (adopting the inline path's nil, because the migrated
      uid's vintage is unrecorded). This affects how migrated Clever
      users match on re-login (the v3 assertion stays where vintage is
      known: omniauth_callbacks_controller.rb:159, :358-361). Owner:
      whoever owns Clever auth. Default: D3 as written.

## 1. Pin current behavior

- [ ] 1.1 Read the live production DCDO value of
      `migration_service_enabled`; record which path is enabled (the
      pinning oracle baseline, design D8)
- [ ] 1.2 Pinning tests against the currently-enabled path for each
      input shape: email user, email-present/hashed-blank, oauth
      (google), Clever, sponsored, parent_managed_student,
      manual_username_password_student, already-migrated — asserting
      the resulting AuthenticationOptions tuples and User fields
- [ ] 1.3 Characterization test reproducing the service's
      AssociationTypeMismatch crash on a no-contact user (design V4)

## 2. Fix

- [ ] 2.1 `MultiAuthMigrator`: skip the option for no-contact users
      (D5), append instead of replace (D6), drop the Clever
      `version = 'v3'` assignment (D3)
- [ ] 2.2 `MultiAuthMigrator#call` owns persistence: short-circuit on
      migrated? without writes, else `save!` + `reload` inside one
      transaction (D1, D7)
- [ ] 2.3 `UserMultiAuthHelper#migrate_to_multi_auth`: delete the
      inline body and the DCDO switch; delegate to the service
- [ ] 2.4 Flip pinning-test expectations only where D2-D5 predict a
      delta (EMAIL predicate, `data: nil` for blank tokens, Clever
      version nil); update `multi_auth_migrator_test.rb:76`
- [ ] 2.5 Remove the six dead
      `DCDO.stubs(:get).with('migration_service_enabled', ...)` stubs
      (report_abuse_controller_test, ai_lesson_summaries_job_test,
      account_purger_test, google_classroom_section_test x2,
      clever_section_test)

## 3. Verify

- [ ] 3.1 `bundle exec spring testunit test/lib/services/user/multi_auth_migrator_test.rb`
- [ ] 3.2 `bundle exec spring testunit test/lib/user_multi_auth_helper_test.rb`
- [ ] 3.3 `bundle exec spring testunit test/integration/registration/migrate_to_multi_auth_test.rb`
- [ ] 3.4 `grep -rn migration_service_enabled dashboard/` returns
      nothing
- [ ] 3.5 `./tools/hooks/pre-commit` clean
