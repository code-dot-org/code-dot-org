# Design: user-email-pref-callback-fix

## Context

The trigger attr `share_teacher_email_reg_partner_opt_in_radio_choice` is
a plain `attr_accessor` (user.rb:288) fed from signup/edit form params
(application_controller.rb:206). The target
`share_teacher_email_regional_partner_opt_in` is a serialized property in
the `properties` blob (user.rb:245), not a column. The callback
(email_preferences.rb:25) fires `after_save` whenever the radio choice is
present, fetches by email (:55), and saves the fetched record (:58).

One subtlety explains why the buggy code does not visibly loop today, and
constrains the fix: the re-fetched instance is a *fresh* object, so it
carries no `attr_accessor` state — its radio choice is nil, the callback
guard is false, and its `save!` does not re-enter. The re-fetch is,
accidentally, the recursion protection. A naive fix of "use `self` and
`save!`" removes that protection: `self` still holds the radio choice, so
the nested save re-fires the callback, assigns a fresh `DateTime.now`
(dirtying `properties` every cycle), and recurses without bound.

## Decisions

**D1 — assign on `self` in `before_save`; drop the fetch and the nested
`save!`.** The timestamp rides the primary write: one UPDATE, no second
save cycle, no re-entrancy question at all. This is the same shape as the
sibling `parent_email_preference_setup` hook (`before_validation`
assignment, email_preferences.rb:22,72-74). Ordering with the
SerializedProperties compaction hook (`before_save` dropping non-present
values, serialized_properties.rb:13) is a non-issue: a `DateTime` is
always `present?`, so it survives compaction whichever hook runs first
(SerializedProperties is included at user.rb:146, before EmailPreferences
at :148). Fallback if `before_save` proves awkward in implementation:
keep `after_save`, operate on `self`, and nil the radio-choice attr
before `save!` — correct, but a second UPDATE per save and re-entrancy
safety that depends on remembering the reset. Prefer D1.

**D2 — preserve write-only-on-yes semantics exactly.** `casecmp?("yes")`
writes the timestamp; "no" neither writes nor clears; non-teachers are
never written. This defect fix changes *which record* is written, not
*when* a write happens. Clearing-on-"no" may be a real product gap, but
it is a behavior change and out of scope.

**D3 — tests assert the record identity, not the mechanism.** The
regression scenarios are expressed against the full save path (not a
direct method call, as the existing test at email_preferences_test.rb:92
does): (a) a teacher saved with "yes" ends with the timestamp on `self`,
persisted, in a single save; (b) when `find_by_email_or_hashed_email`
would return nil (stubbed for the characterization of today's crash), the
save completes and stamps `self`; (c) when the lookup would resolve to a
different account, that account's row is byte-identical before and after,
and `self` carries the timestamp.

## Alternatives rejected

- **Nil-guard the fetch (`return unless user`)**: silences the crash but
  keeps the wrong-record write — fixes half the defect and legitimizes
  the re-fetch pattern.
- **`after_save` on self with radio-choice reset (D1's fallback) as the
  primary shape**: costs an extra UPDATE on every opted-in save and
  couples correctness to a manual attr reset; `before_save` assignment
  gets the same result for free.
- **Move the write to the controller/service layer**: right long-term per
  the report's item 1 (named write commands), but a broader redesign than
  this defect warrants; the concern is the established mechanism today.
