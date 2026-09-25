# Proposal: user-single-multi-auth-migrator

Defect fix from the User Model Improvement Report (July 2026), Addendum 1
finding A3 (verified against source). Independent of other user-model
changes; in particular it does NOT touch the `after_create
:migrate_to_multi_auth` hook itself (user.rb:484), which belongs to
change `user-multi-auth-at-creation`. Zero user-visible impact.

## Why

Two implementations of the single-auth-to-multi-auth migration exist,
selected at runtime by `DCDO.get('migration_service_enabled', false)`
inside `UserMultiAuthHelper#migrate_to_multi_auth`
(dashboard/lib/user_multi_auth_helper.rb:86-89): the inline body
(user_multi_auth_helper.rb:91-133) and
`Services::User::MultiAuthMigrator`
(dashboard/lib/services/user/multi_auth_migrator.rb). They are not
behaviorally identical. Verified divergences: the service creates the
EMAIL authentication option when `email.present? ||
hashed_email.present?` (:59) while the inline path keys only on
`hashed_email.present?` (:117); the service tags Clever options
`version: 'v3'` (:58) while the inline path never sets version; the
token-blob guard differs (truthiness :102 vs `.present?` :40); the
service crashes with `ActiveRecord::AssociationTypeMismatch` on
non-sponsored users with no contact info (`[nil]` collection assignment,
:18/:62 — reproduced by `rails runner`) where the inline path migrates
them cleanly; and the wrapper/inline persistence semantics (save,
reload, idempotent short-circuit) differ. A DCDO flag flip silently
changes persistence semantics — that is a config knob that mutates data
semantics, which is exactly what dynamic config must not do. This code
is hot: the migration runs on every user create via the after_create
hook.

## What Changes

- `Services::User::MultiAuthMigrator` becomes the sole implementation,
  with each divergence resolved by an explicit, justified choice
  (enumerated in design.md; headline: keep the service's EMAIL
  predicate and `.present?` token guard, drop its unconditional Clever
  `version: 'v3'`, fix its no-contact crash, and own persistence —
  `save!` + `reload` — inside the service).
- `UserMultiAuthHelper#migrate_to_multi_auth` body is deleted; the
  method becomes a one-line delegation to the service. The DCDO switch
  (`migration_service_enabled`) is removed; the six dead
  `DCDO.stubs(:get).with('migration_service_enabled', ...)` test stubs
  go with it.
- A pinning-test oracle: for each user shape, the same input user must
  produce the same `AuthenticationOptions` rows and post-migration User
  fields as the currently-enabled path, except where a divergence was
  deliberately resolved the other way (each such delta is asserted, not
  tolerated).

## Capabilities

### New Capabilities

- `user-multi-auth-migration`: exactly one implementation of the
  single-auth-to-multi-auth migration, with pinned semantics for every
  input user shape.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/lib/services/user/multi_auth_migrator.rb` (semantics fixes,
  owns persistence).
- `dashboard/lib/user_multi_auth_helper.rb` (delete inline body + DCDO
  switch, delegate).
- `dashboard/test/lib/services/user/multi_auth_migrator_test.rb` and
  `dashboard/test/lib/user_multi_auth_helper_test.rb` (pinning tests);
  six files with dead DCDO stubs.
- Callers unchanged: `after_create` hook (user.rb:484) and
  `GET /users/migrate_to_multi_auth`
  (registrations_controller.rb:437-443, routes.rb:298) both ignore the
  return value.
- No schema change, no user-facing change, no API change.
