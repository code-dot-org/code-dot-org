# Proposal: user-policy-predicates

Recommendation 2 from the User Model Improvement Report (July 2026),
sequenced ahead of all callback work per the report: high value, low
risk, pure reads. Zero user-visible impact by construction — the User
model keeps thin delegating methods, so every existing caller compiles
and answers identically.

## Why

Authorization about a user is split three ways: ~28 policy predicates
defined on the model (dashboard/app/models/user.rb, e.g.
`can_edit_email?` :1112, `teacher_managed_account?` :1175,
`should_see_edit_email_link?` :1084), a thin `Policies::User`
(dashboard/lib/policies/user.rb, 79 lines), and CanCanCan rules
(dashboard/app/models/ability.rb, 613 lines). The split already forces
round-trips: `User#can_change_own_user_type?` (user.rb:1136) calls back
out to `Policies::User.personal_account?` mid-predicate.

Two pieces of verified duplication make the cost concrete:

- `Policies::User.personal_account?` rebuilds the provider set inline
  (lib/policies/user.rb:60) — the exact computation `User#providers`
  (user.rb:1407-1413) already performs.
- ability.rb repeats the CSA verified-instructor lambda verbatim at
  :565 and :573 (`user.sections_as_student.any? {|s| s.assigned_csa? &&
  s.teacher&.verified_instructor?}`).

`Policies::User` is the house-sanctioned home for exactly this code:
lib/policies/README.md defines Policy Objects as POROs that "tell you
about something" and a place for "code that would otherwise end up on
our Rails models".

## What Changes

- The ~28 pure-read predicates on User (inventoried in design) move to
  `Policies::User` as class methods taking the user, matching the
  existing convention (`Policies::User.personal_account?(user)`,
  `Policies::Lti.restricted_user?(user)`). Bodies are literal copies.
- User keeps a one-line delegating method for each moved predicate, so
  the model's public API is unchanged — zero-impact by construction.
  Caller migration to the policy is mechanical follow-up, not this
  change.
- `Policies::User.personal_account?` consumes `user.providers` instead
  of rebuilding the provider set; the duplicate computation dies. This
  is the one non-literal move, guarded by a Scientist-style parallel
  comparison (design D4).
- ability.rb's duplicated CSA lambda is extracted to one named
  `Policies::User` predicate consumed at both sites — the first step of
  ability.rb consuming policies instead of duplicating role logic.

## Capabilities

### New Capabilities

- `user-policy-layer`: policy predicates about a user are answered by
  `Policies::User`; the User model delegates and answers identically;
  shared predicate logic has exactly one definition.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/lib/policies/user.rb`: grows by ~28 class methods.
- `dashboard/app/models/user.rb`: ~28 predicate bodies become one-line
  delegations; no signature changes.
- `dashboard/app/models/ability.rb`: two duplicated lambdas replaced by
  one policy call (:565, :573).
- New characterization tests pinning predicate answers before/after.
- No schema change, no user-facing change, no API change. Existing
  callers (registrations_controller.rb, sessions_controller.rb,
  user/settings_serializer.rb, devise/registrations/edit.html.haml,
  concerns/user/email_validations.rb, and peers) are untouched.
