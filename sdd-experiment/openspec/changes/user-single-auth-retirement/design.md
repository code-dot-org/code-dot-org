# Design: user-single-auth-retirement

## Context

`provider` is a five-way discriminated union in one string column: NULL
(self-registered email/password, pre-migration), `'manual'`
(teacher-created, username+password, provider_flags.rb:5), `'sponsored'`
(teacher-created, picture/word login, :6), an OAuth credential type
(the set accepted by the migrator, multi_auth_migrator.rb:32-36), or
`'migrated'` (multi-auth shape, :7). `migrated?` compares against the
last of these; `sponsored?` is already dual-shape: for migrated rows it
derives from `authentication_options.empty? && encrypted_password.blank?`
(provider_flags.rb:18-24) — the migrator preserves exactly this by
skipping AO creation for sponsored rows while still stamping
`provider = 'migrated'` (multi_auth_migrator.rb:18-20). So the migrated
representation of every legacy kind already has defined semantics; no
row keeps `provider = 'sponsored'` after conversion.

## Decisions

**D1 — audit predicate: `provider IS NULL OR provider != 'migrated'`,
`with_deleted`.** By provider_flags.rb:10-12 a row is unmigrated iff its
provider is anything but the literal `'migrated'`, and NULL is a
legitimate legacy value (demigrate_from_multi_auth writes `provider =
nil` for email-credentialed rows, user_multi_auth_helper.rb:152), so
NULL rows are unmigrated by definition, not anomalies. The audit groups
by `provider` and, within the NULL group, splits on credential presence
(`encrypted_password`/`hashed_email`): a NULL-provider row with no
credentials at all is an anomaly bucket to triage before backfill, not
convert blindly. Soft-deleted rows are included (`acts_as_paranoid`,
user.rb:507): a later restore would resurrect an unmigrated live row,
and the step-5 column drop destroys their credential data either way.
Read-only, via the reader client (`bin/mysql-client-dashboard-reader`
locally; the prod equivalent read replica).

**D2 — legacy kind predicates collapse, they are not re-derived.** After
backfill, `manual?` and the `provider == 'sponsored'` arm are vacuously
false — rows that were manual/sponsored years ago are `migrated?` today
and already flow through the migrated arms of their call sites
(`managing_own_credentials?` password_validations.rb:65-79,
`email_or_hashed_email_required?` email_validations.rb:73-80,
`username_required?` username.rb:31-33). So: delete `manual?` and its
three call-site branches (`username_required?` becomes
`username_changed?`); `sponsored?` keeps only its derived arm
(`authentication_options.empty? && encrypted_password.blank?`),
unconditionally; `migrated?` itself is deleted with its callers. The
`PROVIDER_*` constants die with the column. Risk check: the one
production write of `PROVIDER_SPONSORED`
(api/v1/sections_students_controller.rb:94) must already be gone or
migrated-shape by the time step 3 runs — that is part of the
`user-multi-auth-at-creation` prerequisite, verified in tasks 0.2.

**D3 — backfill mechanics (the risk locus).** A `bin/oneoff` script
modeled on bin/oneoff/wipe_data/teacher_secret_picture_and_words
(`in_batches(of: 10_000)` :16, `with_deleted` :12), with these
deviations, since AO creation cannot be `update_all`:
- Per row: `Services::User::MultiAuthMigrator.call(user:)` then `save!`
  — the same pair the strangler path already runs in production
  (user_multi_auth_helper.rb:86-89), so the write path is
  production-proven, not bespoke to the script.
- Batches ordered by `id`; last-completed id logged after each batch
  (checkpoint), so the script is resumable with a `--start-id` argument.
  The predicate itself is idempotent — re-running skips converted rows
  (`return true if user.migrated?`, multi_auth_migrator.rb:14).
- Per-row rescue: a validation-dirty legacy row raises on `save!`; the
  script records the id and error to a failures file and continues.
  Failures are triaged manually (expected classes: duplicate AO
  uniqueness, authentication_option.rb:54; ancient invalid rows). No
  blanket `save(validate: false)` — that converts data debt into silent
  corruption.
- Drift metric: the D1 count, re-run after each tranche and daily during
  the ramp; it must be monotonically decreasing and reach zero (modulo
  the triage bucket). Login success-rate dashboards watched across the
  same window.
- Reversibility: `demigrate_from_multi_auth`
  (user_multi_auth_helper.rb:135-160) is the exact inverse and stays in
  the tree until the backfill result is verified; a failed tranche can
  be demigrated by id range. This is why step 4 (delete demigrate) is
  sequenced after step 2, not with the step 3 cleanup.
- Throttle between batches (sleep, as replication-lag courtesy), sized
  during a small canary tranche (e.g. 10k rows) before the full run.

**D4 — branch deletion is mechanical and keeps the migrated arm.** Each
of the 37 sites keeps its `migrated?`-true behavior. Notable non-trivial
sites: `find_by_credential` loses its `User.find_by(provider:, uid:)`
fallback (user.rb:1938) — safe because AO uniqueness is enforced at
authentication_option.rb:54; the create-time uid uniqueness validation
(user.rb:428-432) is deleted for the same reason; the silent-takeover
legacy lookup (`where(provider: SILENT_TAKEOVER_CREDENTIAL_TYPES)`,
omniauth_callbacks_controller.rb:609) is deleted since no row can match
post-backfill; `Services::Lti::AccountLinker`'s defensive
`user.provider = PROVIDER_MIGRATED unless user.migrated?`
(account_linker.rb:26) is dead and goes. `migrate_to_multi_auth` and the
`after_create` hook (user.rb:484) are retired at the end of step 3, once
`user-multi-auth-at-creation` construction is the only birth path and
the backfill has drained the stock; `Services::User::MultiAuthMigrator`
is deleted when its last caller (the oneoff script, now spent) is.

**D5 — two-release column drop.** Release N: `self.ignored_columns =
%w(provider uid)` on User (first use of `ignored_columns` in
dashboard/app/models — no in-repo precedent, but it is the standard
Rails safe-migration staging: running processes' schema caches never see
the columns, so the later DDL cannot break them). Release N+1: migration
dropping `provider`, `uid`, and
`index_users_on_provider_and_uid_and_deleted_at` (schema.rb:2952). The
three `oauth_*` serialized keys are `properties`-blob entries
(user.rb:231-233), not columns: removing them from `serialized_attrs`
ships with step 3 and needs no migration; stale keys left in existing
blobs are inert and may be swept opportunistically later.

**D6 — oracle.** Zero user-visible impact is asserted by: (a) login
success-rate metrics flat across canary, ramp, and full backfill; (b)
the existing pinning suites (user_test.rb, user_multi_auth_helper_test.rb,
omniauth/registration controller tests) green before and after each
step; (c) the D1 drift metric at zero before any deletion ships. The 44
`:demigrated`-trait tests are the legacy shape's own characterization
suite — they are deleted in step 4, not ported, because the shape they
pin ceases to exist (the factory comment says exactly this,
factories.rb:204-206).

## Alternatives rejected

- **Backfill via raw SQL/`update_all`.** Cannot create
  `authentication_options` rows or serialize token JSON; would also
  bypass the production-proven migrator and its idempotence guard.
- **One-release column drop without `ignored_columns`.** Deploys are
  rolling; a process with a cached schema referencing a dropped column
  raises on every users write until restart.
- **Deriving a replacement for `manual?`.** Its migrated-shape
  equivalent (`AOs empty && encrypted_password present`) has zero
  consumers once the three legacy branches are gone; inventing a
  predicate nobody calls is speculative.
- **Keeping `demigrate_from_multi_auth` permanently as an escape hatch.**
  After the columns drop it cannot work (it writes them); keeping it
  past step 5 is a trap, and keeping the columns for its sake defeats
  the change.
- **Deleting branches before the backfill finishes.** The branches are
  the only thing keeping unconverted rows functional; sequencing is
  code-last here precisely because the report's code-first stages
  (migrator unification, email source of truth, creation-time AO) have
  already landed by this change's precondition.
