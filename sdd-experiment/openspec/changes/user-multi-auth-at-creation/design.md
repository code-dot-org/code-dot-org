# Design: user-multi-auth-at-creation

## Context

Creation today is a two-write dance. The first save INSERTs a
single-auth row (legacy columns populated), then
`after_create :migrate_to_multi_auth` (user.rb:484 →
user_multi_auth_helper.rb:85-133) builds the `AuthenticationOption`
from those columns, sets `provider = 'migrated'`, nils the columns, and
saves again. When the `migration_service_enabled` DCDO flag is on
(user_multi_auth_helper.rb:86) the shaping is done by
`Services::User::MultiAuthMigrator` instead; after
`user-single-multi-auth-migrator` lands, that service is the only
implementation, and its `migrated_auth_option` is the single source of
truth for option shape (EMAIL when an email/hashed_email exists, oauth
credential + token JSON + Clever version otherwise, nil for sponsored).

Facts the design leans on, verified against source:

- The hook is idempotent for born-multi-auth users: `return true if
  migrated?` (helper path, user_multi_auth_helper.rb:96) and the same
  early return in the service. The LTI flow exploits this today
  (lib/services/lti.rb:13-27, :106-130; persisted by
  lti_v1_controller.rb:236 and lib/services/lti.rb:193).
- `primary_contact_info` needs no new wiring: `AuthenticationOption`
  runs `after_create :set_primary_contact_info`
  (dashboard/app/models/authentication_option.rb:57, :143-144), which
  fires when the nested option is INSERTed with the user.
- The oauth partial-registration round trip already carries auth
  options. `Policies::User.user_attributes`
  (dashboard/lib/policies/user.rb:17-24) serializes
  `authentication_options_attributes`; User declares
  `accepts_nested_attributes_for :authentication_options`
  (user.rb:366); and `PartialRegistration.cache_key` has a
  migrated-with-options branch (partial_registration.rb:61-63). So a
  born-multi-auth user staged at omniauth_callbacks_controller.rb:234
  survives the session cache and reconstructs in
  `new_from_partial_registration` (partial_registration.rb:14-20).
- `sponsored?` for migrated users means "no auth options and no
  password" (concerns/user/provider_flags.rb:18-24). A bulk-added
  student born with `provider = 'migrated'` and no option satisfies it
  at every point in its life, including during validation before first
  save.
- Migrated users still write the shadow `email`/`hashed_email` columns
  (report finding A1: `normalize_email`/`hash_email` write columns,
  `find_for_authentication` queries them). Born-multi-auth users behave
  identically; the columns' retirement is `user-single-auth-retirement`.

## Decisions

**D1 — one low-level command, flow assembly stays in callers.**
`Services::User::Create` (house pattern: `Services::Base`, keyword
args) takes user attributes plus a credential descriptor and returns an
unsaved User with `provider = User::PROVIDER_MIGRATED` and
`authentication_options` populated (or empty for sponsored). It does
not absorb the flows' parameter wrangling — `UserBuilder`'s permit
lists, `initialize_new_oauth_user`'s omniauth normalization
(user.rb:1642-1681), and the sponsored bulk-add loop keep their jobs
and call the command last. Option shaping delegates to the single
migrator's `migrated_auth_option` logic (extracted, not duplicated) so
creation and migration produce the same shape by construction. The LTI
initializers (lib/services/lti.rb:13, :106) are refactored onto the
command as its first, already-multi-auth consumers.

**D2 — ramp per flow with a DCDO flow allowlist.**
`DCDO.get('multi_auth_at_creation_flows', [])` names the converted
flows (`email`, `oauth`, `roster`, `sponsored`, `join_section`). A
flow not in the list runs today's create-then-migrate path unchanged.
A list of flows was chosen over a percentage: rollback is instant, the
blast radius per step is one flow, and per-flow creation volume is
small enough that a partial-percentage ramp buys nothing. Because the
hook no-ops on migrated users (Context), both paths coexist without
touching the hook during the ramp.

**D3 — the hook is removed in this change, nothing else is.**
`after_create :migrate_to_multi_auth` (user.rb:484) is deleted only
after all five flows are at 100% and the oracle (D5) has been clean for
an agreed soak window. The DCDO flag and the legacy code path in the
callers are removed at the same time. The five legacy columns, the 38
`migrated?` branches, and the prod backfill of pre-existing single-auth
rows stay: that is `user-single-auth-retirement`.

**D4 — `from_omniauth` switches from create-then-mutate to
build-then-save.** Today it calls `create` on a blank user
(user.rb:1613), assigns attributes, then saves. The blank `create` is
expected to fail validation (so `after_create` fires only on the later
save, with the real provider) — but that ordering is an accident, not a
contract. Task 1.2 verifies it before conversion; the converted path
builds via `Services::User::Create` and saves once. The post-save
`update_oauth_credential_tokens(auth)` call (user.rb:1622) already
handles migrated users (user_multi_auth_helper.rb:55-75) and is kept.

**D5 — oracle asserts the invariant, not the mechanism.** After each
flow ramps: `User.where('created_at > ?', ramp_start).where.not(
provider: 'migrated')` must be empty (dev/CI assertion plus a
production query via the reader client during soak). Second invariant,
pinned in tests: bulk-added students have `sponsored?` true, zero
authentication_options, blank `encrypted_password`; email/password
users have exactly one EMAIL option; oauth users exactly one option of
the credential type with tokens in `data`, not in the legacy columns.

**D6 — validation parity is pinned, not assumed.** Creation-time
validations differ subtly between the shapes (e.g. the
`primary_contact_info` validity check at user.rb:412-413, email
uniqueness enforced via users columns vs option rows). Task 1 pins
accept/reject behavior per flow for duplicate email, missing email, and
under-13 cases before any flow converts; the converted flow must
reproduce the pins exactly.

## Alternatives rejected

- Fix inside the hook (build the option in `before_create`): removes
  the second save but keeps the structural write hidden in the callback
  chain — the report's item 5 wants callbacks retired into named
  commands, not relocated.
- One big-bang cutover without DCDO: five flows with different
  parameter shapes and different validation edges; a per-flow ramp
  converts risk into five small reversible steps for the cost of one
  flag read per creation.
- Absorbing all flow assembly into the command (a God-builder):
  recreates the fat-model problem one layer down; the command owns only
  the invariant (born multi-auth), which is the part that must not vary
  per flow.
