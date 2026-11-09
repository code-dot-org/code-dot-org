# Proposal: user-write-api-catalog

Program change from the User Model Improvement Report (July 2026),
recommendation 1 and Addendum 2. Extends `user-write-api-foundation`: the
foundation established the command pattern and one command
(`UpdatePreferences`); this change defines the complete catalog so every
User mutation has a named home, and binds all per-surface migrations to a
single TDD-equivalence discipline.

## Why

The User write surface is unbounded: 46 `update`/`save` call sites across
10 controllers, 26 raw attribute setters, and permit lists that
mass-assign `user_type` (registrations_controller.rb:625-630). Domain
operations exist only as emergent properties of permit lists plus the
18-callback chain, so they cannot be named, audited, or instrumented.
Planning one command (foundation) without the full catalog invites naming
drift and orphan sites; the per-surface migration changes
(user-write-api-registrations, user-write-api-auth-options,
user-write-api-misc-controllers) each need a fixed command vocabulary to
target. Behavioral equivalence before/after is the program's hard
constraint and must be specified once, not per change.

## What Changes

- A verified inventory of every controller-reachable User mutation site,
  each classified: absorbed by command X / deferred to change Y /
  explicitly exempt (Devise-internal controllers, test_controller.rb,
  model-internal saves, throwaway `User.new` in ability.rb:8).
- The command catalog (names fixed program-wide; see design for the full
  table with inputs and absorbed behavior):
  - Existing, kept: `UpgradeToTeacher`, `DowngradeToStudent`,
    `UserTypeSetter`, `UpgradeToPersonalLogin`, `PasswordResetterByEmail`,
    `PasswordResetterByUsername`, `PiiScrubber`, `GenderNormalizer`;
    `MultiAuthMigrator` (retires with user-single-auth-retirement).
  - From in-flight changes: `Create` (user-multi-auth-at-creation),
    `UpdatePreferences` (user-write-api-foundation).
  - New: `UpdateName`, `UpdateEmail`, `UpdatePassword`,
    `UpdateParentEmail`, `UpdateAgeAndState`, `UpdateDemographics`,
    `UpdateEducatorProfile`, `UpdateSchoolInfo`,
    `AcceptTermsOfService`, `AcceptDataTransferAgreement`,
    `AddAuthenticationOption`, `RemoveAuthenticationOption`,
    `SetPrimaryContactInfo`, `GrantPermission`, `RevokePermission`,
    `RevokeAllPermissions`, `SoftDelete`, `Undestroy`, `Purge` (wrapping
    the existing Purgeable concern flows).
- The TDD-equivalence method, specified as requirements binding every
  per-surface change: request-level characterization tests written and
  green BEFORE extraction; identical after; matrix coverage where
  endpoints branch on role or account shape.
- Cop graduation criteria: the foundation's RuboCop cop moves from
  todo-listed to enforcing as each surface completes.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `user-write-api`: extended from "one command exists" (foundation) to
  "the catalog is complete, migrations are equivalence-proven, and the
  cop graduates to enforcing."

## Impact

- Planning-level: fixes command names and scope boundaries for three
  per-surface changes; no application code in this change.
- Implementation vehicles: user-write-api-registrations,
  user-write-api-auth-options, user-write-api-misc-controllers, plus the
  already-authored user-write-api-foundation and
  user-multi-auth-at-creation.
