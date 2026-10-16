# Spec: user-email-lookup-consistency

## ADDED Requirements

### Requirement: Login lookups resolve the current email on every path
Email and hashed-email login lookups SHALL resolve a migrated user by
the email currently on their primary AuthenticationOption, and a
superseded email SHALL NOT resolve them, on every lookup path
(`find_for_authentication`, `find_by_email`, `find_by_hashed_email`)
including the users-table column queries and fallbacks.

#### Scenario: Migrated user changes email via an AO-side write
- **WHEN** a migrated user's primary AuthenticationOption email is
  changed via `update_email_for` (no explicit User save)
- **THEN** login lookups by the new email and its hash resolve the user,
  and lookups by the old email and its hash resolve nothing

#### Scenario: Login-box path after an AO-side email change
- **WHEN** the same user authenticates through the `login`-param branch
  of `find_for_authentication` (username-or-email box)
- **THEN** the new email matches and the old email does not

#### Scenario: Primary AuthenticationOption is destroyed
- **WHEN** a migrated user's primary AuthenticationOption is destroyed
- **THEN** neither the removed email nor its hash resolves the user via
  any lookup path

### Requirement: Legacy columns are a maintained mirror for migrated users
The `users.email` and `users.hashed_email` columns SHALL, for migrated
users, equal the current primary AuthenticationOption's values (blank
when no primary exists) after every AuthenticationOption write, enforced
at AO write time rather than deferred to the next User save.

#### Scenario: Primary AO save syncs the owner's columns
- **WHEN** a primary AuthenticationOption of a migrated user is saved
  with a changed email or hashed_email
- **THEN** the owner's `users.email`/`users.hashed_email` columns equal
  the AO's values immediately, without a User save

#### Scenario: Non-email AO writes do not touch the owner
- **WHEN** an AuthenticationOption is saved without changing email or
  hashed_email (e.g. OAuth token refresh), or a non-primary AO changes
  its email
- **THEN** the owner's User row is not written

#### Scenario: Existing production drift is measured and corrected
- **WHEN** the read-only audit query is run and the backfill is executed
  after the sync hook is deployed
- **THEN** the audit reports zero remaining rows where a migrated user's
  columns disagree with their live primary AuthenticationOption

### Requirement: Unmigrated users keep column-authoritative behavior
The `users.email`/`users.hashed_email` columns SHALL remain the
authoritative store for unmigrated users, written by the existing
`normalize_email`/`hash_email` before_save hooks, with login lookups
unchanged.

#### Scenario: Unmigrated user login (existing behavior pinned)
- **WHEN** an unmigrated user updates their email via `update(email:)`
  and then authenticates by email or hashed email
- **THEN** the new email resolves them, the old one does not, and no
  AuthenticationOption is consulted or created
