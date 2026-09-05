# Design: user-single-multi-auth-migrator

## Context

`migrate_to_multi_auth` converts a pre-multi-auth user (legacy
`provider`/`uid`/`oauth_*`/`hashed_email` columns) into a migrated user
(`provider = 'migrated'`, credentials in `authentication_options`
rows). Two call sites: `after_create :migrate_to_multi_auth`
(user.rb:484) — every new user, so this is the hot path — and
`GET /users/migrate_to_multi_auth`
(registrations_controller.rb:437-443, routes.rb:298), the legacy
self-service route. Both ignore the return value.

Path selection today (user_multi_auth_helper.rb:86-89):

    if DCDO.get('migration_service_enabled', false)
      Services::User::MultiAuthMigrator.call(user: self)
      return save!
    end

All six test files that touch the flag stub it to `false`, and `false`
is the default, so the test suite and (absent a live DCDO override) the
default runtime exercise the INLINE path. The live production value
must be read before deletion (task 1.1); the pinning oracle is defined
against whichever path is currently enabled.

## Complete divergence enumeration

Inline = user_multi_auth_helper.rb:91-133. Service =
services/user/multi_auth_migrator.rb. Wrapper = the DCDO branch above.
Both files were read in full; the guard raise (helper:91-94 vs
service:12,32-36), the sponsored skip, and the legacy-field clearing
(helper:126-130 vs service:20-24) are identical and not listed.

**V1 — EMAIL-option predicate.** Inline creates the EMAIL option only
when `hashed_email.present?` (:117); service when `email.present? ||
hashed_email.present?` (:59). For a row with email set but
hashed_email blank (legacy dirt; normally `hash_email` keeps them in
sync), inline silently drops the credential — the user migrates with
zero authentication options and can no longer be found by email — while
the service builds the option and `AuthenticationOption`'s
`before_validation :hash_email` (authentication_option.rb:46,156-159)
derives the hashed_email.

**V2 — Clever `version` tag.** Service sets `ao.version = 'v3'` for
Clever, explicit nil otherwise (:58); inline never assigns (column
default nil). Only observable for Clever.

**V3 — token-blob guard.** Inline serializes the oauth token JSON when
`oauth_token || oauth_token_expiration || oauth_refresh_token` (:102,
truthiness); service when any field is `.present?` (:40). They differ
for empty-string tokens: inline stores `{"oauth_token":"",...}`,
service stores `data: nil`.

**V4 — no-contact, non-sponsored user.** For provider nil/manual with
blank email AND blank hashed_email, inline migrates with zero options
(the `elsif` at :117 fails; `primary_contact_info = nil` is a no-op).
The service's `migrated_auth_option` returns nil (:62) and
`user.authentication_options = [migrated_auth_option]` (:18) raises
`ActiveRecord::AssociationTypeMismatch: AuthenticationOption expected,
got nil` — verified via `rails runner`. These inputs are real:
`parent_managed_student` (factories.rb:409, email nil, hashed_email
nil, provider nil; cf. `parent_managed_account?` user.rb:1194) and
`manual_username_password_student` (factories.rb:417). Enabling the
flag in production would 500 every parent-managed signup.

**V5 — primary_contact_info mechanism.** Inline assigns
`self.primary_contact_info = ao` directly (:99) and persists everything
in one `save!` (belongs_to autosave writes the new option first). The
service assigns the collection (:18), which on a persisted user INSERTs
the option immediately, then relies on the option's `after_create
:set_primary_contact_info` (authentication_option.rb:57,143-145) to
issue a nested `user.update`. End state is identical; the mechanism is
two independent write points instead of one save.

**V6 — collection replace vs append.** `authentication_options = [ao]`
REPLACES the collection; with `has_many :authentication_options,
dependent: :destroy` (user.rb:365) any pre-existing rows are destroyed.
Inline never touches existing rows. Empty for a genuinely un-migrated
user, destructive on dirty data.

**V7 — persistence, idempotence, reload, return value.** Inline:
`return true if migrated?` before any write (:96); on migration,
`save!` then `reload` (:131-132), returning self. Wrapper: calls the
service (which short-circuits on migrated? without writes, :14) but
then ALWAYS runs `save!` (:88) — a no-op save whose callbacks still
fire on an unchanged user — and never reloads. Return values differ
(self vs true); no caller observes either.

## Decisions

**D1 — the service is the sole implementation and owns persistence.**
`MultiAuthMigrator#call` performs the mutation AND `save!` + `reload`,
wrapped in a single `user.transaction` so the option INSERT and the
provider flip commit or roll back together (closes the partial-state
window in V5/V7). `UserMultiAuthHelper#migrate_to_multi_auth` becomes
`Services::User::MultiAuthMigrator.call(user: self)` — the method stays
because the `after_create` symbol reference (user.rb:484) and the
controller both name it, and removing the hook is out of scope
(user-multi-auth-at-creation). The DCDO switch is deleted.

**D2 (resolves V1) — adopt the service predicate,
`email.present? || hashed_email.present?`.** Dropping a present email
credential is data loss; the AuthenticationOption callbacks already
normalize and hash the email, so the built row is well-formed.

**D3 (resolves V2) — adopt inline: do not set `version`.**
`version: 'v3'` asserts "this authentication_id is a Clever v3 id".
The migrator copies `user.uid`, whose vintage is unrecorded — the oauth
branch runs only for legacy un-migrated rows (new oauth signups get
their option in the omniauth flow,
omniauth_callbacks_controller.rb:156-161, tagged v3 where the vintage
IS known). Tagging a possibly-v2 uid as v3 records a falsehood; nil is
honest, no current caller passes a version to `uid_for_provider`
(user_multi_auth_helper.rb:34), and the legacy-id upgrade path
(omniauth_callbacks_controller.rb:358-361) sets version when it later
proves the id. The explicit `ao.version = nil` else-arm dies too.

**D4 (resolves V3) — adopt the service guard, `.present?`.** An
all-blank token blob carries no information; `present?` states the
intent that truthiness only approximates. Delta vs inline is an
empty-string-token row storing `data: nil` instead of a blob of empty
strings — no reader distinguishes them.

**D5 (resolves V4) — adopt inline: no contact info, no option.** Build
the option list with a conditional (`[migrated_auth_option].compact`
or equivalent), so parent-managed and username-only users migrate with
zero options, exactly as the inline path and years of production
history do. A pinning test covers both factory shapes.

**D6 (resolves V6) — append, do not replace.** Use
`user.authentication_options << ao` (or build-through-association)
rather than collection assignment. Replacement can only ever destroy
rows the migrator did not create; there is no upside.

**D7 (resolves V7) — inline's idempotence and reload semantics.**
`return true if user.migrated?` before any write, no save on the
short-circuit; on migration, `save!` + `reload` inside the D1
transaction. Return value: truthy always, raise on failure — matching
both callers' (non-)use.

**D8 — pinning-test oracle.** For each input shape — password/email
user, email-only (hashed blank), oauth (google), Clever, sponsored,
parent-managed/no-contact, already-migrated — run the currently-enabled
path (per task 1.1) and the unified service against identically-built
users and compare the resulting `AuthenticationOptions` tuples
(credential_type, authentication_id, email, hashed_email, data,
version) plus User fields (provider, uid, oauth_*,
primary_contact_info). Every non-identical field must be one of the
deltas D2-D5 predict, asserted explicitly. The existing
`multi_auth_migrator_test.rb:76` assertion of `version == 'v3'` flips
to nil per D3.

## Alternatives rejected

- Keep the inline body, delete the service: the service is the named,
  separately-tested unit (`Services::Base` pattern) and the report's
  item 1 direction routes User writes through `Services::User::*`;
  inlining is the architectural dead end.
- Ramp the flag to 100% and delete the inline path as-is: ships V4
  (crash on parent-managed signup) and V2 (false v3 tag) to the hot
  path. The flag is not a safe ramp when the two arms disagree.
- Keep both paths but reconcile them: two copies that must be kept
  identical is the defect, not a mitigation.
