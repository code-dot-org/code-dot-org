## ADDED Requirements

### Requirement: New ClassLink accounts use TenantId|SourceId authentication_id
When a user authenticates via ClassLink SSO for the first time, the system SHALL create an `AuthenticationOption` with `authentication_id` set to `<TenantId>|<SourceId>`, where `TenantId` and `SourceId` are extracted from the OmniAuth raw_info payload.

#### Scenario: New ClassLink teacher signs up
- **WHEN** a teacher authenticates via ClassLink SSO for the first time
- **THEN** their `AuthenticationOption.authentication_id` is set to `<TenantId>|<SourceId>` (pipe-delimited)

#### Scenario: New ClassLink student signs up
- **WHEN** a student authenticates via ClassLink SSO for the first time
- **THEN** their `AuthenticationOption.authentication_id` is set to `<TenantId>|<SourceId>` (pipe-delimited)

### Requirement: Dual-match login during migration window
During the transition window (after Phase 1 ships, before all records are migrated), the system SHALL authenticate a ClassLink user if their `authentication_id` matches either the new `<TenantId>|<SourceId>` format or the legacy `<UserId>` format.

#### Scenario: User with new-format authentication_id logs in
- **WHEN** a ClassLink user with `authentication_id = <TenantId>|<SourceId>` authenticates via SSO
- **THEN** the system finds their account and signs them in successfully

#### Scenario: User with legacy UserId authentication_id logs in during migration window
- **WHEN** a ClassLink user with `authentication_id = <UserId>` (legacy format) authenticates via SSO
- **THEN** the system finds their account by `UserId` and signs them in successfully

### Requirement: Login-time migration updates legacy records
When a ClassLink user with a legacy `UserId`-format `authentication_id` signs in successfully, the system SHALL rewrite their `authentication_id` to `<TenantId>|<SourceId>` format in-place, using the values present in the current OmniAuth response. Login-time migration is a first-class migration path sufficient on its own; it does not depend on the bulk migration script having run.

#### Scenario: Legacy user's authentication_id updated at login
- **WHEN** a ClassLink user with a legacy `UserId` authentication_id successfully signs in during the migration window
- **THEN** the system updates their `authentication_id` to `<TenantId>|<SourceId>` format using the values present in the current OmniAuth response

#### Scenario: Already-migrated user logs in
- **WHEN** a ClassLink user whose `authentication_id` is already in `<TenantId>|<SourceId>` format signs in
- **THEN** the system makes no change to their `authentication_id`

### Requirement: Bulk migration script is available as an operational tool
A migration script SHALL be available that updates existing ClassLink `AuthenticationOption` records from `<UserId>` format to `<TenantId>|<SourceId>` format using the ClassLink `v2/my/info` endpoint. Running the script is an operational choice, not a deployment prerequisite; running it before rostering ships is recommended to shrink the window in which unmigrated students can receive duplicate accounts during roster import.

#### Scenario: Record with valid stored OAuth token is migrated
- **WHEN** the migration script runs and a ClassLink auth option has a valid stored `oauth_token`
- **THEN** the script calls `v2/my/info` with that token, extracts `SourceId` and `TenantId`, and updates `authentication_id` to `<TenantId>|<SourceId>`

#### Scenario: Record with expired OAuth token is skipped
- **WHEN** the migration script runs and a ClassLink auth option has an expired `oauth_token`
- **THEN** the script skips that record and logs it; the user self-migrates at next login via login-time migration

### Requirement: Dual-match logic removed after migration completes
Once all ClassLink `AuthenticationOption` records are confirmed to use the new format, the dual-match login fallback SHALL be removed.

#### Scenario: Cleanup phase removes legacy lookup
- **WHEN** all records are migrated and cleanup is deployed
- **THEN** ClassLink login only matches against `<TenantId>|<SourceId>` format authentication_ids
