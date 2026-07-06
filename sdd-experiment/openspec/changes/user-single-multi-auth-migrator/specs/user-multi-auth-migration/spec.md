# Spec: user-multi-auth-migration

## ADDED Requirements

### Requirement: Single migration implementation
The single-auth-to-multi-auth migration SHALL have exactly one
implementation, `Services::User::MultiAuthMigrator`, and no runtime
configuration flag may select between migration behaviors.

#### Scenario: Helper delegates to the service
- **WHEN** `User#migrate_to_multi_auth` is called
- **THEN** `Services::User::MultiAuthMigrator` performs the migration;
  no `DCDO.get('migration_service_enabled', ...)` read occurs

#### Scenario: No divergent inline path remains
- **WHEN** the codebase is searched for `migration_service_enabled`
- **THEN** no production or test reference exists

### Requirement: Migration semantics are pinned per input shape
Migrating a user SHALL set `provider` to `'migrated'`, clear `uid`,
`oauth_token`, `oauth_token_expiration`, and `oauth_refresh_token`,
persist and reload the user, and produce AuthenticationOptions rows
determined solely by the user's pre-migration state as specified by the
scenarios below.

#### Scenario: Email user (email or hashed_email present)
- **WHEN** a non-sponsored user with `email.present? ||
  hashed_email.present?` and a non-OAuth provider is migrated
- **THEN** exactly one EMAIL AuthenticationOption is created carrying
  the user's email and hashed_email (derived from email when blank),
  and it becomes `primary_contact_info`

#### Scenario: OAuth user
- **WHEN** a user with an OAuth provider is migrated
- **THEN** exactly one AuthenticationOption is created with
  `credential_type` = provider, `authentication_id` = uid, `data` = the
  token JSON when any token field is present (else nil), and `version`
  is nil for all providers, Clever included

#### Scenario: Sponsored user
- **WHEN** a sponsored user is migrated
- **THEN** no AuthenticationOption is created and the user remains
  `sponsored?`

#### Scenario: No contact info, not sponsored
- **WHEN** a non-sponsored, non-OAuth user with blank email and blank
  hashed_email (e.g. parent-managed or username-only) is migrated
- **THEN** the migration succeeds with zero AuthenticationOptions and
  no exception is raised

#### Scenario: Already migrated
- **WHEN** `migrate_to_multi_auth` is called on a migrated user
- **THEN** it returns truthy without issuing any write, and existing
  AuthenticationOptions rows are untouched

### Requirement: Migration is atomic
The AuthenticationOption INSERT and the User row update SHALL commit in
one transaction; a failure of either leaves the user un-migrated with
no orphaned AuthenticationOption.

#### Scenario: User save fails mid-migration
- **WHEN** the user update raises after the option row is built
- **THEN** no AuthenticationOption row is persisted and `provider` is
  unchanged
