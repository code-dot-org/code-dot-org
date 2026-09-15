# Design: user-policy-predicates

## Context

### Predicate inventory (dashboard/app/models/user.rb)

All are pure reads: no writes, no memo mutation, no callbacks. Grouped
by the question they answer; line numbers verified against source.

Account-management (the accounts-UI policy cluster):
`can_edit_email?` :1112, `can_edit_password?` :1125,
`can_change_own_user_type?` :1131, `can_delete_own_account?` :1150,
`can_create_personal_login?` :1169, `can_add_parent_email?` :1206,
`should_see_edit_email_link?` :1084, `should_see_add_password_form?`
:1094, `should_disable_user_type?` :1101, `oauth_provided_user_type`
:1105 (not a `?` method, but exists only to serve
`should_disable_user_type?`).

Managed-account classification:
`teacher_managed_account?` :1175, `roster_managed_account?` :1187,
`parent_managed_account?` :1194, `parent_created_account?` :1199,
`secret_word_account?` :785, `secret_picture_account_only?` :792,
`no_personal_email?` :1212, `depends_on_teacher_for_login?` :1391,
`depended_upon_for_login?` :1387.

Section-derived:
`google_classroom_student?` :799, `clever_student?` :804,
`oauth_student?` :809, `can_pair?` :1022, `can_pair_with?` :1026,
`student_of_verified_instructor?` :911, `student_of?` :915.

Permission-derived:
`can_access_student_work?` :902,
`can_view_all_facilitator_landing_pages?` :906.

28 methods; with the two ability.rb lambda sites (:565, :573) this is
the report's "~30". The predicates form a closed call graph among
themselves (`should_see_add_password_form?` calls
`can_create_personal_login?` and `can_edit_password?`;
`secret_word_account?` calls `teacher_managed_account?`; etc.) plus
calls to model readers that stay behind (`student?`, `sponsored?`,
`migrated?`, `oauth?`, `encrypted_password`, associations).

No STI overrides: `Student` and `Teacher` (app/models/student.rb:76,
teacher.rb:76) define only `sti_name`/name helpers, no predicate
overrides, so a class-method move cannot change dispatch.

### The personal_account? duplication

`Policies::User.personal_account?` (lib/policies/user.rb:60):

    providers = user.migrated? ? Set.new(user.authentication_options.pluck(:credential_type)) : Set.new([user.provider])

`User#providers` (user.rb:1407-1413) computes the same set with
`authentication_options.map(&:credential_type)`. The difference is not
cosmetic: `pluck` always issues a fresh query and sees only persisted
rows; `map` walks the loaded association and also sees unsaved
in-memory options. Identical for persisted users — which is every
current caller (users_helper.rb:274, user.rb:1136,
lib/policies/child_account.rb:174; the last is CAP compliance, the
sensitive one) — but not provably identical mid-registration. Hence D4.

## Decision

**D1 — class methods on `Policies::User` taking the user.** House
convention, per lib/policies/README.md and every existing method in the
namespace (`Policies::User.personal_account?(user)`,
`Policies::Lti.restricted_user?(user)`). No instance-based policy
objects, no new namespace.

**D2 — literal-copy bodies; User keeps one-line delegating shims.**
Each moved predicate becomes
`def can_edit_email? = Policies::User.can_edit_email?(self)` (matching
local method-definition style). Intra-cluster calls inside
`Policies::User` go policy-to-policy, not back through the model shim,
so the class is self-contained and shims are removable caller-by-caller
later. Zero-impact by construction: every caller — controllers, the
settings serializer, haml views, `concerns/user/email_validations.rb` —
sees an unchanged API. `oauth_provided_user_type` moves with its sole
consumer `should_disable_user_type?`.

**D3 — `personal_account?` consumes `user.providers`.** The rebuilt set
at lib/policies/user.rb:60 becomes `Set.new(user.providers)`. One
computation, one owner. This changes `pluck` to `map` (see Context);
acceptable and arguably more correct (in-memory state should count),
but it is the only non-literal move in the change.

**D4 — Scientist-style guard on the one risky predicate.** The
`scientist` gem is not in the Gemfile; a full dependency for one
predicate is overkill. Instead, for a soak period, `personal_account?`
computes both the old and new provider sets, reports a mismatch to
Honeybadger, and returns the old answer; a DCDO flag flips to
new-answer, then the guard is deleted. Literal-copy moves (everything
else) need no guard — characterization tests pin them.

**D5 — ability.rb consumes one named predicate.** The verbatim lambda
at ability.rb:565 and :573 becomes
`Policies::User.csa_section_with_verified_instructor?(user)` (final
name at implementation; it must not collide with the different
`student_of_verified_instructor?`, which checks any teacher, not
CSA-assigned sections). This is deliberately the only ability.rb edit:
it removes duplication without re-litigating CanCanCan rules.

**D6 — explicit non-goals.** Out of scope: role readers (`student?`
:886, `teacher?` :890, `levelbuilder?` :894 — pervasive, trivial,
low-value churn); auth-state readers (`migrated?`, `sponsored?`,
`oauth?`, `oauth_only?` — owned by the dual-auth retirement track);
predicates already living in trait concerns
(app/models/concerns/user/ai_accessible.rb etc.); migrating callers off
the shims; and the RuboCop responsibility cop forbidding new model
predicates (report item 6, separate tooling change).

## Alternatives rejected

- Move callers to `Policies::User` directly, no shims: touches 8+
  files including haml views and a serializer in one change, and every
  touched call site is a chance to diverge. Shims make the move
  provably behavior-preserving; caller migration is mechanical
  follow-up.
- Consolidate into ability.rb instead: these are account-state
  questions ("can this user edit their email?"), not resource
  authorization; forcing them through `can?` inverts the dependency and
  bloats the 613-line initializer further.
- Adopt the `scientist` gem: right shape, wrong size — one predicate
  needs a guard, and DCDO + Honeybadger already provide the flag and
  the mismatch channel.
