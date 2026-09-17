# Tasks: user-single-auth-retirement

## 0. Preconditions (hard gate)

- [ ] 0.1 `user-multi-auth-at-creation` landed and ramped to 100%; its
      consistency oracle (zero users with `provider != 'migrated'`
      post-create) green for at least one full week
- [ ] 0.2 Verify no remaining creation-time legacy writes: grep for
      `PROVIDER_SPONSORED`/`PROVIDER_MANUAL` assignment at `User.create`
      sites (was api/v1/sections_students_controller.rb:94)
- [ ] 0.3 `user-single-multi-auth-migrator` landed:
      `Services::User::MultiAuthMigrator` is the only migrator, no DCDO
      fork remains in `migrate_to_multi_auth`

## 1. Production audit (read-only)

- [ ] 1.1 Run the D1 predicate on a read replica: `provider IS NULL OR
      provider != 'migrated'`, `with_deleted`, grouped by `provider` and
      (for NULL) by credential presence
- [ ] 1.2 Triage the anomaly bucket (NULL provider, no credentials);
      record disposition per group before any write
- [ ] 1.3 Record baseline counts as the drift metric's starting point

## 2. Backfill (the risk locus)

- [ ] 2.0 **DECISION (blocking, before 2.3)**: schedule the run window
      against the school calendar — this is a K-12 platform and
      back-to-school (Aug-Sep) is peak; summer break is the default
      window. Same ask names the failures-file triage owner and the
      DB-ops reviewer for batch size/replica-lag thresholds. Owner:
      platform lead + DBA.

- [ ] 2.1 Write `bin/oneoff` script per design D3: `in_batches(of:
      10_000)` over `with_deleted` legacy rows, per-row
      `MultiAuthMigrator.call` + `save!`, id checkpointing with
      `--start-id` resume, per-row rescue to a failures file, inter-batch
      throttle (precedent:
      bin/oneoff/wipe_data/teacher_secret_picture_and_words)
- [ ] 2.2 Test the script against seeded legacy rows (the `:demigrated`
      factory trait is the fixture generator here): idempotence,
      resume-from-checkpoint, failure isolation, demigrate round-trip
- [ ] 2.3 Canary tranche (~10k rows) in production; verify converted rows
      (AO contents vs former column values), watch login success-rate and
      replica lag; size the throttle
- [ ] 2.4 Full run; drift metric re-checked per tranche and daily until
      zero (modulo triage bucket); login metrics flat across the window
- [ ] 2.5 Triage and resolve the failures file; final audit count zero

## 3. Delete the dual-path branches (only after 2.5)

- [ ] 3.1 user.rb: collapse the 16 `migrated?` sites to their migrated
      arms; delete the uid create validation (:428-432), the
      `find_by_credential` column fallback (:1938); retire `after_create
      :migrate_to_multi_auth` (:484)
- [ ] 3.2 Concerns: provider_flags.rb collapses per D2 (`sponsored?`
      derived-only; `migrated?`/`manual?`/`PROVIDER_*` deleted);
      password_validations.rb, email_validations.rb, username.rb,
      partial_registration.rb lose legacy arms
- [ ] 3.3 Controllers: omniauth_callbacks_controller.rb (4 sites + :609
      silent-takeover legacy query), registrations_controller.rb (3),
      authentication_options_controller.rb (1); drop `:provider` from
      admin_search/find_students.html.haml:56
- [ ] 3.4 lib: policies/user.rb:60, upgrade_to_teacher.rb,
      upgrade_to_personal_login.rb, lti/account_linker.rb:26; delete the
      dual-path readers in user_multi_auth_helper.rb
      (`oauth_tokens_for_provider`, `uid_for_provider`,
      `update_oauth_credential_tokens` legacy arms)
- [ ] 3.5 Remove `oauth_refresh_token`/`oauth_token`/
      `oauth_token_expiration` from `serialized_attrs` (user.rb:231-233)
- [ ] 3.6 Pinning suites green with no modification to migrated-shape
      tests; `./tools/hooks/pre-commit` clean

## 4. Delete the demigration escape hatch (only after step 3 is stable)

- [ ] 4.1 Delete `demigrate_from_multi_auth`
      (user_multi_auth_helper.rb:135-160) — at this point the file is
      empty; delete it and its include
- [ ] 4.2 Delete the `:demigrated` factory trait (factories.rb:208-210)
      and its 44 usages across 14 test files (delete the tests: they pin
      the retired shape)
- [ ] 4.3 Delete `Services::User::MultiAuthMigrator` (last caller, the
      spent oneoff script, archived)

## 5. Drop the columns (two releases)

- [ ] 5.1 Release N: `self.ignored_columns = %w(provider uid)` on User;
      verify users reads/writes in a console against a schema still
      containing the columns
- [ ] 5.2 Release N+1: migration dropping `provider`, `uid`, and
      `index_users_on_provider_and_uid_and_deleted_at`; remove
      `ignored_columns`; regenerate schema annotations
- [ ] 5.3 Post-drop smoke: sign-in each credential type (email, OAuth,
      picture/word, LTI) on staging; login metrics flat in production

## 6. Verify

- [ ] 6.1 Final D1 audit query returns zero rows (columns gone: query
      fails structurally — run before 5.2, then assert migration applied)
- [ ] 6.2 `grep -rn '\bmigrated?\|demigrate_from_multi_auth\|PROVIDER_MANUAL\|PROVIDER_SPONSORED\|PROVIDER_MIGRATED' dashboard/app dashboard/lib` returns nothing
- [ ] 6.3 Full dashboard test suite green; `./tools/hooks/pre-commit`
      clean; login success-rate dashboards reviewed one week post-drop
