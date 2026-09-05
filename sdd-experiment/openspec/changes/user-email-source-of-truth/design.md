# Design: user-email-source-of-truth

## Context

Verified stale path, end to end:

1. A migrated user (`provider == 'migrated'`, provider_flags.rb:10-12)
   has an email-bearing primary AO; the `users.email`/`hashed_email`
   columns mirror it as of the last User save, because
   `before_save :normalize_email, :hash_email` (user.rb:469-470) read
   through the migrated-aware getters (:570-578) and write the columns
   with plain writers (:610, :615). No `email=`/`hashed_email=` override
   exists anywhere in the model or its concerns (grep-verified).
2. `update_email_for` (user.rb:729-738) mutates the AO directly:
   `auth_option&.update(email: email)` (:734). AO-side
   `before_validation :normalize_email, :hash_email`
   (authentication_option.rb:46, bodies :147-159) update the AO row. The
   User is never saved; its columns keep the old email and old hash.
   Reachable from omniauth silent takeover
   (omniauth_callbacks_controller.rb:523-527).
3. Login with the NEW email: `find_for_authentication` hashed_email
   branch (user.rb:1995-1998) -> `find_by_hashed_email` -> AO
   trusted_email hit (:1957) -> correct user. Works.
4. Login with the OLD email: AO lookup misses (the AO now carries the
   new hash) -> fallback `User.find_by(hashed_email:)` (:1958) matches
   the stale column -> the superseded credential authenticates.
5. Login-box path (`login` param, :1989-1994) queries the columns only:
   the OLD email matches, the NEW email does not.

By contrast, `update_primary_contact_info` (user.rb:740-775) goes
through `save` on the User (:763), so the before_save hooks refresh the
columns; that path does not drift. The drift is specifically AO writes
that bypass a User save.

A student wrinkle narrows what the hooks can ever fix:
`remove_student_cleartext_email` (authentication_option.rb:135-137)
blanks AO cleartext for students, so `User#normalize_email`/`hash_email`
early-return on blank (:609, :614) and can never refresh a migrated
student's `hashed_email` column from cleartext — for students the User
save path itself is not a reliable refresher. The fix must live on the
AO side.

## Decision

**D1 — columns become an explicitly maintained derived cache, synced at
AO write time; setter overrides rejected.** An AO `after_save` hook (and
`after_destroy`, see D3) copies `email`/`hashed_email` onto the owner's
User row when the AO is the owner's `primary_contact_info` and the owner
is migrated. Invariant: for migrated users, the columns equal the
current primary AO's values (blank when no primary AO exists) after
every AO write. Setter overrides were the alternative and fail twice
over: (a) they sit on the wrong side — the drift source is AO-side
writes (`auth_option.update` at user.rb:734) that no User setter ever
executes; (b) the plain writers are load-bearing — Devise, the
before_save hooks themselves, and dirty-tracking-guarded validations
(`email_changed? || hashed_email_changed?`, email_validations.rb:12;
format check :9) all depend on column-attribute semantics. Rerouting
them is the full dual-model collapse (report item 3, backfill-last
stage), not a staged defect fix. The sync hook is additive and
reversible; with zero drift it is a no-op.

**D2 — sync via `update_columns`, not `update!`.** The values are
copied verbatim from an AO that already ran its own normalize/hash
(authentication_option.rb:46); running the 18-callback User chain would
recompute identical values at best, and at worst raises on
legacy-invalid users or fires unrelated side effects mid-AO-write.
`update_columns` also cannot recurse (no callbacks -> no further AO or
User writes). `updated_at` is deliberately untouched: a cache refresh is
not a user edit. This is the mirror-image of user-admin-revocation-audit
D1 — there, callbacks carry the audited behavior and must fire; here,
the callbacks are the thing being compensated for and must not.

**D3 — hook scope: primary + migrated + email actually changed;
destroy included.** Guard: `user && primary? && user.migrated? &&
(saved_change_to_email? || saved_change_to_hashed_email?)` (`user` is
optional on AO, authentication_option.rb:43; `primary?` at :131-133).
The guard keeps `update_oauth_credential_tokens` (:186-195, data-only
writes) free. `after_destroy` blanks the owner's columns when the
destroyed AO was the primary: `acts_as_paranoid` (:42) hides the deleted
row from the association, so the getters already return `''` — the
mirror must follow or the stale hash remains a live credential, which is
the exact defect. Ordering with `after_create :set_primary_contact_info`
(:57) is safe: after_create runs before after_save, so by the time the
sync guard evaluates, `primary?` is settled; the double write on
creation (set_primary_contact_info's `user.update` also refreshes via
before_save hooks) is idempotent.

**D4 — TODO resolution: replace, keep the query.** The comment at
user.rb:1987-1988 flagged that the login-box branch queries the users
table while multi-auth data lives elsewhere. With the D1 invariant the
column query is correct by construction for migrated users and
authoritative for unmigrated ones, and it uses existing users-table
indexes. Replace the TODO with one comment stating the invariant and
naming the AO sync hook. The `find_by_hashed_email` fallback (:1958)
also stays: it is the only path for unmigrated users, and post-backfill
it can no longer resolve a superseded hash for migrated users (the
column equals the current hash; a stale hash matches nothing).

**D5 — staging: audit, then hook, then backfill.** The audit is
read-only and runs first to size the problem. The hook deploys next and
stops new drift. The backfill runs last so nothing drifts behind it.
Audit query (via `./bin/mysql-client-dashboard-reader`; blank-insensitive
because `normalize_email` early-returns leave NULL columns where AO
defaults are `''`, and neither `''` nor NULL matches a real login):

```sql
-- class 1: live primary AO disagrees with the mirror
SELECT COUNT(*) AS drifted
FROM users u
JOIN authentication_options ao
  ON ao.id = u.primary_contact_info_id AND ao.deleted_at IS NULL
WHERE u.provider = 'migrated'
  AND u.deleted_at IS NULL
  AND (COALESCE(u.email, '') <> ao.email
    OR COALESCE(u.hashed_email, '') <> ao.hashed_email);

-- class 2: no live primary AO but non-blank mirror (stale credential)
SELECT COUNT(*) AS orphaned
FROM users u
LEFT JOIN authentication_options ao
  ON ao.id = u.primary_contact_info_id AND ao.deleted_at IS NULL
WHERE u.provider = 'migrated'
  AND u.deleted_at IS NULL
  AND ao.id IS NULL
  AND (COALESCE(u.email, '') <> '' OR COALESCE(u.hashed_email, '') <> '');
```

Backfill: class 1 rows get `update_columns(email: ao.email,
hashed_email: ao.hashed_email)` in_batches — mechanical, same values
the hook would write. Class 2 rows are inspected before blanking
(expected sources: destroyed-primary accounts, partial migrations); the
audit decides whether they are blanked mechanically or triaged.
`update_columns` skips validations by design: uniqueness collisions
between a backfilled hash and some other user's column are shadowed at
lookup time by the AO-first branch, and refusing the backfill would
preserve the defect.

## Out of scope (observed, unchanged)

- Untrusted-email semantics: `find_by_hashed_email` excludes untrusted
  AOs (`trusted_email` scope, :1957) yet the column fallback can match a
  mirror of an untrusted email's hash. Pre-existing wrinkle, orthogonal
  to freshness; belongs to the dual-auth retirement proper.
- Deleting the columns and the `migrated?` branches: report item 3's
  final stage, after the production backfill of all users.

## Alternatives rejected

- Setter overrides routing `email=`/`hashed_email=` to the AO: wrong
  side of the write, breaks dirty-tracking-guarded validations, and is
  the un-staged big-bang version of item 3 (see D1).
- Re-saving the User inside `update_email_for`: fixes one caller,
  leaves every other AO write path (console, future callers, AO
  destroys) free to recreate the drift. The invariant must hold at the
  AO, where the mutation happens.
- Querying AOs instead of columns in `find_for_authentication`'s
  login-box branch: changes a hot Devise path and still needs the
  column fallback for unmigrated users; the derived cache gets the same
  correctness without touching the query.
