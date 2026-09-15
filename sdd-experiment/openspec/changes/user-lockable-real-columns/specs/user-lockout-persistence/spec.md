# Spec: user-lockout-persistence

## ADDED Requirements

### Requirement: Lockout state lives in real columns
Lockout state SHALL be stored in real users-table columns —
`failed_attempts` (integer, NOT NULL, default 0) and `locked_at`
(nullable datetime) — written and read through standard ActiveRecord
attribute access, with no lockout state in the serialized `properties`
blob.

#### Scenario: Explicit zero persists
- **WHEN** `failed_attempts` is set to `0` and the user is saved (as
  Devise's unlock and reset paths do)
- **THEN** the stored value is `0` — not silently dropped by the
  `properties` compaction — and reads back as `0`, not `nil`

#### Scenario: Lockout state is queryable
- **WHEN** an operator runs SQL against the users table
- **THEN** currently-locked accounts and failed-attempt counts are
  selectable directly from `locked_at` and `failed_attempts`, without
  parsing `properties`

### Requirement: Lockout behavior is unchanged
Brute-force lockout behavior SHALL be identical before and after the
column migration: teachers lock after `maximum_attempts` consecutive
failures, students never lock, and both unlock strategies (email
token, `unlock_in` expiry) keep working, with lock/unlock metrics
still emitted.

#### Scenario: Teacher locks after maximum attempts
- **WHEN** a teacher fails authentication `maximum_attempts` times
- **THEN** the account is locked (`access_locked?` true) and the
  attempt count reflects every failure

#### Scenario: Students are never locked
- **WHEN** a student fails authentication any number of times
- **THEN** no failed attempts accumulate and the account is never
  locked

#### Scenario: Time-based unlock
- **WHEN** a locked account's `unlock_in` interval elapses
- **THEN** the account authenticates normally and its failed-attempt
  count resets to 0

### Requirement: Devise customization is declared at the model
Lockable customization SHALL be included in the User model itself,
adjacent to the `devise :lockable` declaration; the stock
`Devise::Models::Lockable` module SHALL NOT be monkeypatched globally,
and stock Lockable persistence primitives (including raw-SQL
`increment_counter`) SHALL work unmodified against the schema.

#### Scenario: No global patch of the gem
- **WHEN** the application boots
- **THEN** `Devise::Models::Lockable` has no application module
  prepended onto it, and User's customizations are visible as an
  `include` in user.rb next to the other Devise overrides

#### Scenario: Stock increment works against the schema
- **WHEN** stock Devise increments failed attempts via
  `increment_counter(:failed_attempts, id)`
- **THEN** the SQL succeeds against a real column, so a Devise upgrade
  that bypasses the custom increment degrades loudly or not at all —
  never into silent lockout loss
