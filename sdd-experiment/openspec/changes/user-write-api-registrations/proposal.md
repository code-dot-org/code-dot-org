# Proposal: user-write-api-registrations

Per-surface migration change under user-write-api-catalog. Depends on:
user-write-api-foundation (command base, call/call! contract),
user-write-api-catalog (command names, TDD-equivalence method). Zero
user-visible impact.

## Why

registrations_controller.rb is the densest User write surface — seven
mutation endpoints driving account identity, type, and lifecycle through
generic attribute writes:

- `update` (:121-146) — profile update via
  `update_with_password`/`update_without_password` (:133/:138) over a
  wide permit list (`update_params`, :572).
- `set_student_information` (:309-320) — `current_user.update(...)` for
  age/us_state/name slices.
- `set_parent_email` (:365-369) — `update_without_password`.
- `set_user_type` (:386-412) — `update_with/without_password` over a
  permit list including `user_type` itself (:625-630); the operation
  "student becomes teacher" is an emergent property of mass assignment
  plus the callback chain (`fix_by_user_type` PII-blanking and
  StudioPerson destroy/create, user.rb:646-663).
- `update_user_email` (:484-501) — three arms:
  `update_primary_contact_info` (migrated), `update_with_password`,
  `update_without_password`.
- `upgrade` (:322) — account upgrade flows.
- `destroy` (:234, :650 `destroy_users`) — soft-delete of self and
  dependents.

None of these operations has a name in the code; none can be audited or
instrumented as a unit; each rides the full 18-callback chain.

## What Changes

Each endpoint delegates to its catalog command, tests-first:

- `update` → decomposed into `UpdateName` + `UpdatePassword` +
  `UpdateDemographics` slices (single command invocation per changed
  slice; the Devise current-password gate — `needs_password?` :542 —
  moves into the commands' shared precondition, preserving exactly which
  updates demand current_password).
- `set_student_information` → `UpdateAgeAndState` (+ `UpdateName` slice).
- `set_parent_email` → `UpdateParentEmail`.
- `set_user_type` → `SetUserType` (wrapping
  `UpgradeToTeacher`/`DowngradeToStudent`; returns a correctly-classed
  object per user-sti-becomes-consistency; `user_type` leaves the
  mass-assignment permit list).
- `update_user_email` → `UpdateEmail` (owning all three arms; the
  migrated/unmigrated split lives inside the command until
  user-single-auth-retirement deletes it — callers never see it).
- `destroy` → `SoftDelete` (self + dependent users).
- Permit lists shrink to the fields each command consumes.

## Capabilities

### New Capabilities

- `user-account-mutation-registrations`: registrations endpoints mutate
  User state only through named catalog commands, with proven
  behavioral equivalence.

### Modified Capabilities

<!-- none -->

## Impact

- `dashboard/app/controllers/registrations_controller.rb` (delegation +
  permit-list shrink), new/extended `Services::User::*` commands, new
  request-level characterization tests, command unit tests.
- Coordinates with: user-sti-becomes-consistency (SetUserType return
  contract), user-multi-auth-at-creation (creation endpoints in this
  controller are that change's scope, not this one's).
