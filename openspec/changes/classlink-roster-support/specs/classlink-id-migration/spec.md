## ADDED Requirements

### Requirement: Rostering identity components are validated before use
The system SHALL treat `TenantId` and `SourcedId` as valid only when each is non-blank after string conversion and contains no `|` character. When either fails, the system SHALL NOT construct a v2 `authentication_id`, SHALL log the user's `UserId`, and SHALL allow login to proceed via the legacy v1 record.

#### Scenario: Blank SourcedId does not produce a colliding identifier
- **WHEN** a ClassLink login payload has `TenantId` present but `SourcedId` blank or absent
- **THEN** no v2 auth option is created, the failure is logged, and login proceeds against the user's v1 record — so two users in the same tenant can never both be assigned `authentication_id = "<TenantId>|"`

#### Scenario: Pipe inside a component is rejected
- **WHEN** either `TenantId` or `SourcedId` contains a `|`
- **THEN** no v2 auth option is created, since the joined identifier would parse ambiguously

#### Scenario: Integer and string TenantId yield the same identifier
- **WHEN** `TenantId` arrives as the integer `2` from `v2/my/info` and as `"2"` from the `/applications` response
- **THEN** both normalize to the same `authentication_id` and the same credential cache key

### Requirement: New ClassLink accounts use versioned TenantId|SourcedId authentication_id
When a user authenticates via ClassLink SSO for the first time, the system SHALL create an `AuthenticationOption` with `authentication_id` set to `<TenantId>|<SourcedId>` (extracted from the OmniAuth raw_info payload) and `version` set to `v2`.

#### Scenario: New ClassLink teacher signs up
- **WHEN** a teacher authenticates via ClassLink SSO for the first time
- **THEN** their `AuthenticationOption` is created with `authentication_id = <TenantId>|<SourcedId>` (pipe-delimited) and `version = 'v2'`

#### Scenario: New ClassLink student signs up
- **WHEN** a student authenticates via ClassLink SSO for the first time
- **THEN** their `AuthenticationOption` is created with `authentication_id = <TenantId>|<SourcedId>` (pipe-delimited) and `version = 'v2'`

### Requirement: Dual-match login during migration window
During the transition window (after Phase 1 ships, before all users have v2 records), the system SHALL authenticate a ClassLink user if their identifiers match either a v2 record (`<TenantId>|<SourcedId>` format) or a legacy v1 record (`<UserId>` format).

#### Scenario: User with a v2 auth option logs in
- **WHEN** a ClassLink user with a v2 auth option (`authentication_id = <TenantId>|<SourcedId>`) authenticates via SSO
- **THEN** the system finds their account via the v2 record and signs them in successfully

#### Scenario: User with only a legacy v1 auth option logs in during migration window
- **WHEN** a ClassLink user whose only auth option is legacy format (`authentication_id = <UserId>`) authenticates via SSO
- **THEN** the v2-format lookup misses, the system falls back to lookup by `UserId`, finds their account, and signs them in successfully

### Requirement: Login-time migration creates a v2 auth option
When a ClassLink user is authenticated via the legacy `UserId` fallback, the system SHALL create a new ClassLink `AuthenticationOption` on that user with `authentication_id = <TenantId>|<SourcedId>` (from the live OmniAuth response) and `version = 'v2'`, leaving the legacy v1 record intact. Login-time migration is a first-class migration path sufficient on its own; it does not depend on the bulk migration script having run.

#### Scenario: Legacy user receives a v2 auth option at login
- **WHEN** a ClassLink user with only a legacy v1 auth option successfully signs in during the migration window
- **THEN** the system creates a new auth option with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'` on the same user, and the v1 record is not modified or deleted

#### Scenario: User with both records logs in
- **WHEN** a ClassLink user who already has both a v1 and a v2 auth option signs in
- **THEN** the system authenticates via the v2 record and creates no additional records

### Requirement: Bulk migration script is available as an operational tool
A migration script modeled on `bin/oneoff/clever/clever_v3_migration.rb` SHALL be available that creates v2 auth options (via `Services::Classlink::V2AuthOptionBuilder`) for existing ClassLink users, using the ClassLink `v2/my/info` endpoint to resolve `SourcedId` and `TenantId`. The script SHALL support dry-run and commit modes. Running the script is an operational choice, not a deployment prerequisite; running it before rostering ships is recommended to shrink the window in which unmigrated students can receive duplicate accounts during roster import.

#### Scenario: Record with valid stored OAuth token is migrated
- **WHEN** the migration script runs in commit mode and a v1-only ClassLink auth option has a valid stored `oauth_token`
- **THEN** the script calls `v2/my/info` with that token, extracts `SourcedId` and `TenantId`, and creates a new auth option on the same user with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`, leaving the v1 record intact

#### Scenario: Record with expired OAuth token is skipped
- **WHEN** the migration script runs and a ClassLink auth option has an expired `oauth_token`
- **THEN** the script skips that record and logs it; the user self-migrates at next login via login-time migration

#### Scenario: User already has a v2 auth option
- **WHEN** the migration script processes a user who already has a v2 ClassLink auth option
- **THEN** the script creates no duplicate record (builder returns nil)

#### Scenario: Dry-run mode makes no changes
- **WHEN** the migration script runs in dry-run mode
- **THEN** it reports the records that would be migrated without persisting any new auth options

### Requirement: Migration is reversible by deleting v2 records
Rolling back the ID migration SHALL consist of deleting ClassLink auth options with `version = 'v2'` belonging to users who also retain a v1 ClassLink auth option. Users whose only auth option is v2 (new signups after Phase 1) SHALL be excluded from the deletion.

#### Scenario: Rollback restores legacy login
- **WHEN** v2 auth options are deleted for users who retain a v1 record (and migration code is reverted)
- **THEN** those users authenticate via their untouched v1 `UserId` records exactly as before the migration

#### Scenario: Post-Phase-1 signups are preserved on rollback
- **WHEN** the rollback deletion runs against a user whose only ClassLink auth option is v2
- **THEN** that record is not deleted and the user can still sign in

### Requirement: Dual-match logic removed after migration completes
Once all active ClassLink users have v2 auth options, the dual-match login fallback SHALL be removed and v1 records retired.

#### Scenario: Cleanup phase removes legacy lookup
- **WHEN** all active users have v2 records and cleanup is deployed
- **THEN** ClassLink login only matches against v2-format (`<TenantId>|<SourcedId>`) auth options
