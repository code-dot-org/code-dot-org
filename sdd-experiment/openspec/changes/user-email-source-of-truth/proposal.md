# Proposal: user-email-source-of-truth

Defect fix from the User Model Improvement Report (July 2026), Addendum 1
finding A1 (verified against source; the highest-severity finding). A
staged sub-step of report item 3 (dual-auth retirement), shippable on its
own with no ordering constraints. Zero user-visible impact beyond closing
the defect itself.

## Why

For migrated users, `User#email`/`User#hashed_email` read from
`primary_contact_info` (dashboard/app/models/user.rb:570-578), but the
`users.email`/`users.hashed_email` columns remain the values the login
path queries. The columns are refreshed only as a side effect of saving
the User: `before_save :normalize_email, :hash_email` (registered at
user.rb:469-470, bodies at :608-616) read through the getters and write
the columns via plain attribute writers — no setter override exists. Any
write that changes the primary AuthenticationOption's email without also
saving the User leaves the columns stale.

Such a write ships today: `update_email_for` (user.rb:729-738) calls
`auth_option&.update(email: email)` at :734 for migrated users — the AO's
own `before_validation :normalize_email, :hash_email`
(authentication_option.rb:46) recomputes the AO row, and the User row is
never touched. It is reachable from the omniauth silent-takeover path
(omniauth_callbacks_controller.rb:523-527).

The stale columns are live login credentials:

- `find_for_authentication`'s login-box branch (user.rb:1989-1994)
  matches `email = :value OR hashed_email = :hashed_value` against the
  columns only, so after an AO-side email change the OLD email still
  authenticates and the NEW one does not, on that path.
- `find_by_hashed_email` (user.rb:1955-1959) checks AOs first, but its
  fallback `User.find_by(hashed_email:)` at :1958 resolves the stale
  column hash — a misses-AO lookup with the superseded email finds and
  authenticates the user. `find_by_email` (:1946-1950) has the same
  fallback shape.

The same region carries a shipped `# TODO: multi-auth (@eric, before
merge!)` comment (user.rb:1987-1988) flagging exactly this path.

## What Changes

- The columns become an explicitly maintained mirror of the primary
  AuthenticationOption for migrated users: an AO `after_save` (and
  `after_destroy`) hook syncs the owner's columns whenever the primary
  AO's email/hashed_email change — decided in design over setter
  overrides, which sit on the wrong side of the write (the drift source
  is AO-side writes that no User setter ever sees).
- The stale TODO at user.rb:1987 is replaced with a comment stating the
  new invariant; the column query itself stays (indexed, and now correct
  by construction).
- A read-only audit query measures existing drift in production; a
  backfill corrects drifted rows after the sync hook is deployed.
- Pinning tests cover login-by-email and login-by-hashed-email for both
  migrated and unmigrated users, including the defect repro (AO email
  changed via `update_email_for`, then both old- and new-email login
  attempts).
- Unmigrated users are untouched: the columns remain their authoritative
  store, pinned by test.

## Capabilities

### New Capabilities

- `user-email-lookup-consistency`: email/hashed-email login lookups
  resolve against a user's current primary contact info; the legacy
  columns are a maintained mirror for migrated users, never a stale
  shadow.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/app/models/authentication_option.rb` (one sync hook).
- `dashboard/app/models/user.rb` (comment at :1987 only).
- New tests in `dashboard/test/models/` pinning login resolution.
- One read-only prod audit query; one backfill script for drifted rows.
- No schema change, no API change. The only behavior delta is the defect
  closing: a superseded email stops authenticating and the current one
  works on every path.
