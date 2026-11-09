# Proposal: user-single-auth-retirement

Final stage of Recommendation 3 from the User Model Improvement Report
(July 2026): retire the legacy single-auth account shape entirely. Hard
dependency: `user-multi-auth-at-creation` must be landed and its
consistency oracle green (zero users with `provider != 'migrated'`
post-create) before anything here runs — otherwise the backfill chases a
moving target. Also assumes `user-single-multi-auth-migrator` has landed,
leaving `Services::User::MultiAuthMigrator` as the only migrator. Zero
user-visible impact; oracle is login success-rate metrics flat across the
backfill ramp plus the existing pinning suites.

## Why

Every user still carries two possible account shapes. The legacy shape
stores credentials on the users row itself (`provider`, `uid` columns —
dashboard/db/schema.rb:2908-2909 — plus serialized `oauth_token`,
`oauth_token_expiration`, `oauth_refresh_token` keys in the `properties`
blob, dashboard/app/models/user.rb:231-233); the multi-auth shape stores
them in `authentication_options` rows. `migrated?` (`provider ==
'migrated'`, dashboard/app/models/concerns/user/provider_flags.rb:10-12)
selects between them at 37 call sites across 13 files (grep `\bmigrated?`
over dashboard/app and dashboard/lib, excluding the definition): 16 in
user.rb (`email`/`hashed_email` getters :571/:576, `find_credential`
:688, `oauth?` :714, `oauth_only?` :722, `providers` :1408, among
others), 5 in dashboard/lib/user_multi_auth_helper.rb, 4 in
omniauth_callbacks_controller.rb, 3 in registrations_controller.rb, and
one each in nine more files. Every one of those branches must be reasoned
about twice on every auth change; the report calls this the most
expensive residue in the model, and stages its removal code-first,
backfill-last — "the backfill is where the risk lives; everything before
it is reversible code cleanup."

Once `user-multi-auth-at-creation` stops new single-auth rows from being
born, the remaining unmigrated rows are a finite population and the
branches serve only them. Convert the rows, and the branches — and the
columns — are dead code.

Two report claims corrected against source. "Five legacy columns" is
actually two real columns plus three serialized keys (above); the drop is
correspondingly two-part. And `demigrate_from_multi_auth`'s "one
remaining LTI reference" does not exist: grep shows zero production
references — the definition (user_multi_auth_helper.rb:135) is reached
only from tests (the `:demigrated` factory trait,
dashboard/test/factories/factories.rb:208-210, referenced 44 times across
14 test files, plus user_multi_auth_helper_test.rb:594 and
user_test.rb:396). The lti files touch `provider` but never demigrate
(services/lti.rb:14, services/lti/account_linker.rb:26 both *set*
`PROVIDER_MIGRATED`).

## What Changes

Five steps, strictly ordered; each is a separate PR (or more):

1. **Read-only production audit.** Count remaining legacy rows:
   `provider IS NULL OR provider != 'migrated'`, including soft-deleted
   rows (`acts_as_paranoid`, user.rb:507), grouped by `provider` value
   and by credential presence. Exact predicate rationale in design D1.
2. **Backfill.** `in_batches` conversion of every remaining row via
   `Services::User::MultiAuthMigrator` (the single migrator), as a
   `bin/oneoff` script following the house precedent
   bin/oneoff/wipe_data/teacher_secret_picture_and_words (`in_batches(of:
   10_000)` at :16, `with_deleted` at :12). Checkpointed, reversible
   per-row (the inverse, `demigrate_from_multi_auth`, stays alive until
   step 4), drift metric published. This is the risk locus; design D3.
3. **Delete the dual-path branches.** All 37 `migrated?` call sites
   collapse to their migrated arm; `manual?` and the legacy arm of
   `sponsored?` become vacuously false and their branches delete
   (design D2); legacy-column SQL goes with them (`find_by_credential`
   fallback user.rb:1938, create-time uid validation user.rb:428-432,
   silent-takeover query omniauth_callbacks_controller.rb:609).
4. **Delete `demigrate_from_multi_auth`** (user_multi_auth_helper.rb:
   135-160), the `:demigrated` factory trait, and its 44 test usages —
   only after step 2's result is verified, because it is the rollback
   tool.
5. **Drop the legacy storage.** `self.ignored_columns` for `provider` and
   `uid` in one release; a migration dropping both columns and the
   `index_users_on_provider_and_uid_and_deleted_at` unique index
   (schema.rb:2952) in the next; remove the three `oauth_*` keys from
   `serialized_attrs` alongside step 3 (they are blob keys, not columns —
   no migration needed).

## Capabilities

### New Capabilities

- `user-multi-auth-shape`: every user row, live or soft-deleted, exists
  in the multi-auth shape; auth reads have exactly one code path; the
  legacy columns are gone.

### Modified Capabilities

<!-- none: no existing spec covers the account shape -->

## Impact

- `dashboard/app/models/user.rb` (16 branch sites, `after_create
  :migrate_to_multi_auth` at :484, `serialized_attrs` oauth keys,
  schema annotations).
- `dashboard/lib/user_multi_auth_helper.rb` deleted outright (every
  method is either a dual path or the migration/demigration pair).
- `dashboard/app/models/concerns/user/provider_flags.rb` collapses to
  derived predicates (design D2); `password_validations.rb`,
  `email_validations.rb`, `username.rb`, `partial_registration.rb` lose
  their legacy arms.
- Controllers: `omniauth_callbacks_controller.rb`,
  `registrations_controller.rb`, `authentication_options_controller.rb`;
  view `admin_search/find_students.html.haml:56` drops the `:provider`
  display field (admin-facing only).
- `dashboard/lib/policies/user.rb:60`, `services/user/upgrade_to_teacher.rb`,
  `services/user/upgrade_to_personal_login.rb`,
  `services/lti/account_linker.rb:26`,
  `services/user/multi_auth_migrator.rb` (retired last, with the
  `after_create` hook, once no caller remains).
- New `bin/oneoff` backfill script; one schema migration; large test
  churn (44 `:demigrated` usages across 14 files).
- No user-facing change. No API change. One admin-search column removed.
