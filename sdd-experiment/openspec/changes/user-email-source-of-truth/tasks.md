# Tasks: user-email-source-of-truth

## 1. Pin current behavior

- [ ] 1.1 Characterization tests for login resolution today: unmigrated
      user by email/hashed_email; migrated user after
      `update_primary_contact_info` (no drift — User save refreshes
      columns)
- [ ] 1.2 Defect repro test: migrated user, `update_email_for` changes
      the primary AO email; pin that the OLD email still resolves via
      the `find_by_hashed_email` fallback and the `login`-param branch,
      and the NEW email fails on the `login`-param branch (current
      broken behavior, flipped in 2.3)

## 2. Fix

- [ ] 2.1 AO sync hook in `authentication_option.rb`: `after_save` and
      `after_destroy` copy email/hashed_email onto the owner via
      `update_columns` when `user && primary? && user.migrated?` and the
      email fields changed (design D1-D3); destroy blanks the columns
- [ ] 2.2 Replace the `# TODO: multi-auth (@eric, before merge!)`
      comment (user.rb:1987-1988) with the invariant comment naming the
      sync hook (design D4)
- [ ] 2.3 Flip the 1.2 pins to the fixed expectations: new email
      resolves on all paths, old email resolves on none; add the
      destroyed-primary and non-primary/data-only-write scenarios

## 3. Audit and backfill (production, staged)

- [ ] 3.1 Run the class-1/class-2 audit queries (design D5) read-only
      via `./bin/mysql-client-dashboard-reader` against prod; record
      counts in the PR
- [ ] 3.2 Deploy the sync hook (stops new drift) before any backfill
- [ ] 3.3 Backfill class-1 rows in_batches with `update_columns` from
      the live primary AO; verify the class-1 audit returns zero
- [ ] 3.4 Triage class-2 rows per the audit (blank mechanically only if
      the population is what design D5 expects)

## 4. Verify

- [ ] 4.1 `bundle exec spring testunit test/models/authentication_option_test.rb`
- [ ] 4.2 `bundle exec spring testunit test/models/user_test.rb`
- [ ] 4.3 `./tools/hooks/pre-commit` clean
