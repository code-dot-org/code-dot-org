## ADDED Requirements

### Requirement: A blank SourcedId routes to the permanent legacy path
ClassLink documents `SourcedId` as empty when a district does not have OneRoster enabled, so a blank value is a supported production state, not an error. When the SSO payload's `SourcedId` is blank after string conversion, the system SHALL NOT construct a v2 `authentication_id`, SHALL NOT report the event as an anomaly, and SHALL process the sign-up or sign-in on the legacy v1 (`UserId`) path exactly as it did before this change.

#### Scenario: Sign-in from a non-OneRoster district
- **WHEN** an existing ClassLink user whose SSO payload carries no `SourcedId` signs in
- **THEN** the system finds their account by the legacy `UserId` lookup, signs them in, creates no v2 auth option, and reports nothing to error tracking

#### Scenario: Blank SourcedId does not produce a colliding identifier
- **WHEN** a ClassLink login payload has `TenantId` present but `SourcedId` blank or absent
- **THEN** no v2 auth option is created — so two users in the same tenant can never both be assigned `authentication_id = "<TenantId>|"`, which would silently collide them onto one auth option

### Requirement: Anomalous identity components are rejected and reported
When `SourcedId` is present but a v2 `authentication_id` still cannot be built — `TenantId` blank after string conversion, or `TenantId` containing a `|` — the system SHALL NOT construct the identifier, SHALL report the event with the user's `UserId` for follow-up, and SHALL allow the sign-up or sign-in to proceed on the legacy v1 path. These shapes have no documented meaning, unlike a blank `SourcedId`.

#### Scenario: Pipe inside TenantId is rejected
- **WHEN** `TenantId` contains a `|`
- **THEN** no v2 auth option is created (the joined identifier would parse ambiguously), the event is reported, and login proceeds via the legacy path

#### Scenario: Blank TenantId with SourcedId present is rejected
- **WHEN** the payload carries a non-blank `SourcedId` but `TenantId` is blank or absent
- **THEN** no v2 auth option is created, the event is reported, and login proceeds via the legacy path

#### Scenario: Integer and string TenantId yield the same identifier
- **WHEN** `TenantId` arrives as the integer `2` from `v2/my/info` and as `"2"` from the `/applications` response
- **THEN** both normalize to the same `authentication_id` and the same credential cache key

### Requirement: New ClassLink accounts are versioned by what the payload carries
When a user authenticates via ClassLink SSO for the first time and the payload carries a non-blank `SourcedId`, the system SHALL create an `AuthenticationOption` with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`. When the payload carries no `SourcedId`, the system SHALL create a legacy-format `AuthenticationOption` with `authentication_id = <UserId>` and `version` nil, identical to pre-change signups.

#### Scenario: New teacher signs up from an OneRoster-enabled district
- **WHEN** a teacher whose SSO payload carries a `SourcedId` authenticates via ClassLink for the first time
- **THEN** their `AuthenticationOption` is created with `authentication_id = <TenantId>|<SourcedId>` (pipe-delimited) and `version = 'v2'`

#### Scenario: New student signs up from an OneRoster-enabled district
- **WHEN** a student whose SSO payload carries a `SourcedId` authenticates via ClassLink for the first time
- **THEN** their `AuthenticationOption` is created with `authentication_id = <TenantId>|<SourcedId>` (pipe-delimited) and `version = 'v2'`

#### Scenario: New user signs up from a non-OneRoster district
- **WHEN** a user whose SSO payload carries no `SourcedId` authenticates via ClassLink for the first time
- **THEN** their `AuthenticationOption` is created with `authentication_id = <UserId>` and `version` nil, exactly as ClassLink signups worked before this change

### Requirement: Dual-match login is permanent
The system SHALL authenticate a ClassLink user whose identifiers match either a v2 record (`<TenantId>|<SourcedId>` format) or a legacy v1 record (`<UserId>` format), trying the v2-format lookup first. This dual lookup is durable routing logic, not a transition mechanism: the v1 path is the only login path for districts without OneRoster enabled, and it SHALL NOT be removed.

#### Scenario: User with a v2 auth option logs in
- **WHEN** a ClassLink user with a v2 auth option (`authentication_id = <TenantId>|<SourcedId>`) authenticates via SSO
- **THEN** the system finds their account via the v2 record and signs them in successfully

#### Scenario: User with only a legacy v1 auth option logs in with a SourcedId present
- **WHEN** a ClassLink user whose only auth option is legacy format (`authentication_id = <UserId>`) authenticates via SSO with a payload carrying a `SourcedId`
- **THEN** the v2-format lookup misses, the system falls back to lookup by `UserId`, finds their account, and signs them in successfully

#### Scenario: User with only a legacy v1 auth option logs in with no SourcedId
- **WHEN** a ClassLink user whose only auth option is legacy format authenticates via SSO from a non-OneRoster district (no `SourcedId` in the payload)
- **THEN** the system finds their account by `UserId` and signs them in, indefinitely — this path has no sunset

### Requirement: Login-time migration creates a v2 auth option when a SourcedId is available
When a ClassLink user is authenticated via the legacy `UserId` fallback and the live OmniAuth response carries a non-blank `SourcedId`, the system SHALL create a new ClassLink `AuthenticationOption` on that user with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`, leaving the legacy v1 record intact. Login-time migration is the only migration mechanism; there is no bulk migration.

#### Scenario: Legacy user in an OneRoster district receives a v2 auth option at login
- **WHEN** a ClassLink user with only a legacy v1 auth option signs in and the payload carries a `SourcedId`
- **THEN** the system creates a new auth option with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'` on the same user, and the v1 record is not modified or deleted

#### Scenario: User with both records logs in
- **WHEN** a ClassLink user who already has both a v1 and a v2 auth option signs in
- **THEN** the system authenticates via the v2 record and creates no additional records

#### Scenario: Legacy user in a non-OneRoster district is never migrated
- **WHEN** a ClassLink user with only a legacy v1 auth option signs in repeatedly with payloads carrying no `SourcedId`
- **THEN** no v2 auth option is ever created, and each sign-in succeeds via the v1 record — an expected steady state, not a migration failure

#### Scenario: A district enables OneRoster later
- **WHEN** a district that previously had no OneRoster enables it, so its users' SSO payloads begin carrying `SourcedId`
- **THEN** each user picks up a v2 auth option at their next sign-in through this same mechanism, with no code change and no operational action

### Requirement: Migration is reversible by deleting v2 records
Rolling back the ID migration SHALL consist of deleting ClassLink auth options with `version = 'v2'` belonging to users who also retain a v1 ClassLink auth option. Users whose only auth option is v2 (new signups with a `SourcedId` after Phase 1) SHALL be excluded from the deletion.

#### Scenario: Rollback restores legacy login
- **WHEN** v2 auth options are deleted for users who retain a v1 record (and migration code is reverted)
- **THEN** those users authenticate via their untouched v1 `UserId` records exactly as before the migration

#### Scenario: Post-Phase-1 signups are preserved on rollback
- **WHEN** the rollback deletion runs against a user whose only ClassLink auth option is v2
- **THEN** that record is not deleted and the user can still sign in

### Requirement: Legacy v1 records are never retired
The system SHALL NOT delete, archive, or rewrite legacy v1 ClassLink auth options as part of this change, and SHALL NOT remove the `UserId` fallback lookup. Users in non-OneRoster districts hold v1 records as their only credential permanently, and a v1 record alone cannot reveal which population its holder belongs to — the record stores only `UserId`, which identifies no district.

#### Scenario: No cleanup phase exists
- **WHEN** all users in OneRoster-enabled districts have converged to holding v2 records
- **THEN** the dual-match fallback and every v1 record remain in place, because non-OneRoster districts still authenticate exclusively through them
