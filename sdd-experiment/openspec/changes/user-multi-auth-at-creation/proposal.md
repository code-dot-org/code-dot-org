# Proposal: user-multi-auth-at-creation

Mid stage of recommendation 3 from the User Model Improvement Report
(July 2026): retire the dual auth model, staged code-first,
backfill-last. Depends on `user-single-multi-auth-migrator` (one
migrator implementation must land first; this change reuses its
auth-option shaping). The production backfill of old rows and deletion
of the `migrated?` branches and legacy columns are explicitly out of
scope (change `user-single-auth-retirement`). Zero user-visible impact.

## Why

Every persisted user is still created single-auth and converted to
multi-auth by a second write: `after_create :migrate_to_multi_auth`
(dashboard/app/models/user.rb:484, implementation in
dashboard/lib/user_multi_auth_helper.rb:85-133). The hook builds the
`AuthenticationOption` from the legacy columns (`provider`, `uid`,
`oauth_token`...), flips `provider` to `'migrated'`, nils the columns,
and saves again. This is the root cause named in every historical doc —
six years of duplicate auth options, broken password reset, "two user
models" — and a structural write in `after_create` is the canonical
callback smell. Any code that observes a user between the first INSERT
and the hook's second save sees a single-auth account.

The in-house exemplar already exists. The LTI flow builds the account
multi-auth on the unsaved record: `Services::Lti.initialize_lti_user`
(dashboard/lib/services/lti.rb:13-27) sets
`provider = ::User::PROVIDER_MIGRATED` and assigns
`user.authentication_options = [ao]` before the first save;
`initialize_lti_user_from_nrps` (lib/services/lti.rb:106-130) does the
same. For those users the hook is a no-op (`return true if migrated?`,
user_multi_auth_helper.rb:96). Nothing prevents every other flow from
doing likewise.

Construction-site inventory (each read against source):

Persisting funnels — four paths write new users to the database:

1. `Services::PartialRegistration::UserBuilder`
   (dashboard/lib/services/partial_registration/user_builder.rb:13-15):
   `User.new_with_session` + `save!`, called from
   registrations_controller.rb:157. Finishes sign-up for both
   email/password and oauth partial registrations.
2. `User.from_omniauth` (dashboard/app/models/user.rb:1609-1624):
   `create`, `initialize_new_oauth_user`, `becomes!`, `save`. Called
   from omniauth_callbacks_controller.rb:195 (oauth callback) and
   dashboard/app/models/sections/omni_auth_section.rb:69 (Clever /
   Google Classroom roster import).
3. `Api::V1::SectionsStudentsController#bulk_add`
   (dashboard/app/controllers/api/v1/sections_students_controller.rb:92-102):
   `User.create!(provider: User::PROVIDER_SPONSORED, ...)` — the only
   sponsored-user creation site.
4. `FollowersController#student_register`
   (dashboard/app/controllers/followers_controller.rb:32-34, saved at
   :56): word/picture section join creating a username+password
   account.

Non-persisting sites — `User.new` as attribute stagers or value
carriers; never saved on that path:
registrations_controller.rb:46 (begin_sign_up validation, attributes go
to the session cache); omniauth_callbacks_controller.rb:234, :268, :314
(oauth sign-up staging, persisted to session by `register_new_user`,
:401); omniauth_callbacks_controller.rb:655 and
lti/v1/account_linking_controller.rb:73-75 (`new_with_session` to read
or amend session attributes); password_resetter_by_email.rb:27, :32
(error carrier); ability.rb:8 (throwaway guest — excluded per report).

## What Changes

- New `Services::User::Create` construction command: given attributes
  and a credential descriptor, returns a user born multi-auth —
  `provider = 'migrated'`, `AuthenticationOption` built and attached
  before the first save (email/password, oauth, and LTI cases), or no
  option at all (sponsored case). Auth-option shaping is shared with
  the single migrator from `user-single-multi-auth-migrator`, so the
  born-multi-auth shape and the migrated shape cannot drift.
- The four persisting funnels are converted to the command one flow at
  a time, each behind a DCDO flag; flag off reproduces today's
  create-then-migrate behavior byte for byte.
- `after_create :migrate_to_multi_auth` (user.rb:484) is removed once
  every flow is ramped to 100% and the oracle has been clean: it is
  already a no-op for born-multi-auth users, which is what makes the
  per-flow ramp safe.
- Pinning tests on every sign-up flow assert the post-create shape
  (provider, auth options, sponsored invariant) before and after
  conversion.
- Oracle: zero users with `provider != 'migrated'` created after the
  ramp, plus the sponsored invariant (`sponsored?` true, no auth
  options, blank password) for bulk-added students.

## Capabilities

### New Capabilities

- `user-account-construction`: every persisted user is created
  multi-auth at initialization time, through one named construction
  command; no post-create conversion write exists.

### Modified Capabilities

<!-- none: no existing spec covers user construction -->

## Impact

- New `dashboard/lib/services/user/create.rb` (name final in design).
- `dashboard/lib/services/partial_registration/user_builder.rb`,
  `dashboard/app/models/user.rb` (`from_omniauth`, hook removal),
  `dashboard/app/controllers/omniauth_callbacks_controller.rb` (oauth
  staging sites),
  `dashboard/app/controllers/api/v1/sections_students_controller.rb`,
  `dashboard/app/controllers/followers_controller.rb`.
- New/extended tests pinning post-create account shape per flow.
- No schema change, no user-facing change, no API change. Legacy
  columns and `migrated?` branches untouched (out of scope).
