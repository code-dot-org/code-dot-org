# Spec: user-multi-auth-shape

## ADDED Requirements

### Requirement: Every user row exists in the multi-auth shape
Every user row, live or soft-deleted, SHALL have `provider = 'migrated'`
semantics: credentials live in `authentication_options` rows (or, for
sponsored users, in the derived no-AO/no-password state), never in
legacy per-user fields.

#### Scenario: Audit finds no legacy rows after backfill
- **WHEN** the audit predicate (`provider IS NULL OR provider !=
  'migrated'`, including soft-deleted rows) is run after the backfill
  completes
- **THEN** the count is zero, excepting only rows parked in the triage
  bucket with a recorded failure reason

#### Scenario: Sponsored users are represented without a provider tag
- **WHEN** a teacher-created picture/word student is inspected after
  retirement
- **THEN** `sponsored?` derives from having no authentication options
  and a blank `encrypted_password`, and the user logs in exactly as
  before

#### Scenario: Soft-deleted rows are converted too
- **WHEN** a soft-deleted legacy user is restored after the backfill
- **THEN** the restored row is already in the multi-auth shape and
  functions without any legacy-column data

### Requirement: The backfill is checkpointed, observable, and reversible
The production backfill SHALL convert rows in id-ordered batches through
`Services::User::MultiAuthMigrator`, checkpoint progress so it is
resumable, isolate per-row failures without aborting, publish a drift
metric, and remain reversible per row until its result is verified.

#### Scenario: Interrupted run resumes without rework
- **WHEN** the backfill script is stopped and restarted from its last
  checkpoint
- **THEN** it resumes at the recorded id and re-processing an already
  converted row is a no-op

#### Scenario: A validation-dirty row does not halt the batch
- **WHEN** a row raises on save during conversion
- **THEN** its id and error are recorded to the failures list and the
  batch continues; the row is triaged manually, not force-saved

#### Scenario: Rollback of a bad tranche
- **WHEN** verification after a tranche shows incorrect conversions
- **THEN** the affected id range is restored to the legacy shape via
  `demigrate_from_multi_auth`, which remains in the tree until the
  backfill result is verified

### Requirement: Auth reads have exactly one code path
Authentication and credential reads SHALL NOT, once the backfill is
verified, branch on account shape: `migrated?`, `manual?`, and all
dual-path branches are removed, and no query touches the legacy
`provider`/`uid` columns.

#### Scenario: Credential lookup uses authentication options only
- **WHEN** a user is located by SSO credential
- **THEN** the lookup resolves solely through `AuthenticationOption`
  with no fallback query on `users.provider`/`users.uid`

#### Scenario: Dual-path call sites collapse to the migrated arm
- **WHEN** `providers`, `oauth?`, `oauth_only?`, `find_credential`, or
  the email getters are called on any user
- **THEN** the answer comes from `authentication_options` (or
  `primary_contact_info`) unconditionally, with behavior identical to
  the former migrated arm

### Requirement: Legacy credential storage is removed with staged drops
The `provider` and `uid` columns SHALL be dropped only after a full
release in which they are declared in `ignored_columns`, and the
serialized `oauth_token`, `oauth_token_expiration`, and
`oauth_refresh_token` keys SHALL be removed from `serialized_attrs` with
the code that read them.

#### Scenario: Columns are ignored before they are dropped
- **WHEN** the drop migration runs in production
- **THEN** every running app process is already on a release that lists
  `provider` and `uid` in `ignored_columns`, so no schema-cache error
  occurs during the rolling deploy

#### Scenario: The provider/uid unique index goes with the columns
- **WHEN** the drop migration completes
- **THEN** `index_users_on_provider_and_uid_and_deleted_at` no longer
  exists and no code path attempts to enforce or query it

### Requirement: Retirement is invisible to users
The retirement SHALL cause no user-visible behavior change: login
success-rate metrics stay flat across the canary, ramp, and full
backfill, and the pinning suites pass unchanged before and after each
step.

#### Scenario: Login metrics flat across the ramp
- **WHEN** login success-rate dashboards are compared across the
  backfill window
- **THEN** no regression is attributable to the conversion, for any
  credential type (email, OAuth, picture/word, LTI)

#### Scenario: Pinning suites unaffected by branch deletion
- **WHEN** the dual-path branch deletions land
- **THEN** the existing characterization tests for migrated-user
  behavior pass without modification; only tests that construct the
  legacy shape (the `:demigrated` trait) are deleted
