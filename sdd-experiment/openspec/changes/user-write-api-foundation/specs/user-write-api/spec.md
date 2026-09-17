# Spec: user-write-api

## ADDED Requirements

### Requirement: Preference mutations go through one named command
User preference and UI-flag attributes SHALL be written only through
`Services::User::UpdatePreferences`, which accepts an explicit, frozen
attribute allowlist and rejects any other key before assigning
anything.

#### Scenario: Allowlisted attribute is written
- **WHEN** `UpdatePreferences.call(user:, updates: {mute_music: true})`
  runs
- **THEN** the attribute is assigned and saved with the same semantics
  as the raw `user.mute_music = true; user.save` it replaces, and the
  save result is returned

#### Scenario: Non-allowlisted attribute is rejected
- **WHEN** `updates` contains a key outside the allowlist (e.g.
  `user_type` or `admin`)
- **THEN** the command raises before any attribute is assigned and no
  write occurs

#### Scenario: Raising and lenient variants preserve endpoint semantics
- **WHEN** an endpoint that previously used `save!`/`update!` delegates
  via `call!`, and one that used `save` delegates via `call`
- **THEN** validation failures raise in the former and return false in
  the latter, exactly as before delegation

### Requirement: Delegation leaves controller responses unchanged
Every migrated api/v1/users_controller preference endpoint SHALL
return the same response status and body, and persist the same
attribute value, as it did before delegation to `UpdatePreferences`.

#### Scenario: Characterization tests pass unmodified
- **WHEN** the pinning tests written against the pre-delegation
  controller are run against the delegated controller
- **THEN** all pass without edits: same status, same body, same
  persisted value, same unauthorized behavior

### Requirement: Raw User mutations in controllers are flagged by lint
A custom RuboCop cop SHALL flag `.update`/`.save`/`.update_attribute`/
`.update_column`/`.update_columns`/`.assign_attributes`/attribute-
writer calls on User receivers (`current_user`, `@user`, `user`,
`User`-rooted chains) in `dashboard/app/controllers`, with existing
violations enumerated as todo Excludes rather than fixed.

#### Scenario: New violation fails lint
- **WHEN** a controller file not on the Exclude list contains
  `current_user.update!(name: 'x')`
- **THEN** the cop reports an offense and pre-commit fails

#### Scenario: Service-layer writes are not flagged
- **WHEN** code under `dashboard/lib/services/user/` saves a User
- **THEN** the cop reports nothing

#### Scenario: Enumerated legacy violations stay silent
- **WHEN** pre-commit lints a file on the todo Exclude list
- **THEN** the cop reports nothing for that file, and the Exclude list
  itself enumerates every currently violating controller

### Requirement: Command invocations are instrumented
Every invocation of an instrumented `Services::User` command SHALL emit
exactly one metric identifying the command by name.

#### Scenario: UpdatePreferences emits one metric per call
- **WHEN** `UpdatePreferences.call` or `.call!` is invoked
- **THEN** exactly one `Cdo::Metrics` count is emitted, dimensioned by
  the command name, whether or not the save succeeds

#### Scenario: Instrumentation does not alter outcomes
- **WHEN** the underlying save raises
- **THEN** the exception propagates to the caller unchanged
