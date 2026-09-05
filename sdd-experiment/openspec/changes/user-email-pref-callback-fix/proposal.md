# Proposal: user-email-pref-callback-fix

Defect fix from the User Model Improvement Report (July 2026), Addendum 1
finding A4 (verified against source). Independent of all other user-model
changes; no ordering constraints. Zero user-visible impact.

## Why

`save_email_reg_partner_preference` is an `after_save` callback on User
(registered at dashboard/app/models/concerns/user/email_preferences.rb:25,
guarded only on the radio-choice attr being present). Instead of operating
on the record that was just saved, it re-resolves the user by email:
`User.find_by_email_or_hashed_email(email)` (email_preferences.rb:55),
then mutates and `save!`s the *fetched* record (:57-58). The `teacher?`
guard sits after the fetch (:56).

Two failure modes, both real:

- **Nil deref.** `find_by_email_or_hashed_email` returns nil for a blank
  email or a hash miss (dashboard/app/models/user.rb:1964-1968; the hashed
  lookup consults only `AuthenticationOption.trusted_email` and the
  `users.hashed_email` column, user.rb:1955-1959). A miss makes :57 raise
  NoMethodError inside `after_save`, aborting the enclosing save and
  rolling back the transaction — the user's own save fails because of an
  optional marketing preference.
- **Wrong-record write.** The lookup returns the *first* account matching
  the email hash, which is not guaranteed to be `self` when another
  account shares the hash. The opt-in timestamp is then stamped onto a
  different user, and that record's full save (with its own 18-callback
  chain) runs as a side effect.

Both are impossible by construction with `self`: the callback already
holds the correct, just-saved record. The re-fetch buys nothing — it is
either redundant (resolves to self) or wrong (nil or another account).

## What Changes

- `save_email_reg_partner_preference` stops re-fetching: the timestamp
  `share_teacher_email_regional_partner_opt_in` is assigned on `self`.
  Design settles the hook shape (`before_save` assignment so the value
  rides the primary write, vs. `after_save` with re-entrancy protection —
  see design D1; the naive "use self and `save!`" recurses).
- Regression tests pin the two failure modes: a save whose email lookup
  would miss completes and stamps `self`; a colliding email leaves the
  other account untouched.
- No semantic change otherwise: "yes" (case-insensitive) writes the
  timestamp, "no" remains a no-op (does not clear), non-teachers are
  never written.

## Capabilities

### New Capabilities

- `user-reg-partner-opt-in`: the regional-partner email-share opt-in is
  recorded on the record being saved, never on a record resolved by
  email lookup.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/app/models/concerns/user/email_preferences.rb` (one method,
  one callback macro).
- `dashboard/test/models/concerns/user/email_preferences_test.rb`
  (existing `#save_email_reg_partner_preference` block at :91-109 updated;
  regression scenarios added).
- No schema change, no user-facing change, no API change. The form
  parameter feeding the attr (`application_controller.rb:206`) is
  untouched.
