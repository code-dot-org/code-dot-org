# Design: user-write-api-catalog

## Command catalog

Names are program-fixed; per-surface changes must not invent variants.
All commands follow the foundation's contract: `call` (lenient, returns
result object) / `call!` (raising), `Services::Base` conventions, one
instrumentation seam per invocation.

| Command | Absorbs (evidence) | Notes |
|---|---|---|
| Create | all persisting construction funnels | defined in user-multi-auth-at-creation |
| UpdatePreferences | 18 serialized-flag actions, api/v1/users_controller.rb:199-412; rubrics_controller.rb:373-379 (`ai_rubrics_tour_seen`, teacher-guarded) | foundation |
| UpdateName | name/given_name/family_name slices of registrations `update_params` (:572) | |
| UpdateEmail | update_user_email flow (registrations :484-501), `update_primary_contact_info` (user.rb:763-772) | migrated + unmigrated arms until retirement |
| UpdatePassword | password slice of `update_params`; Devise current-password gate preserved | |
| UpdateParentEmail | set_parent_email (registrations :365-369) | |
| UpdateAgeAndState | set_student_information (:309-320), `enforce_age_or_state_update` callback (user.rb:2014) | absorbs the throwaway-User validation rebuild |
| UpdateDemographics | gender/races slices; wraps GenderNormalizer | |
| UpdateSchoolInfo | api/v1/user_school_infos_controller.rb:38 + registrations school_info nested attrs | also owns user_school_infos confirmation write (:42-43) |
| AcceptDataTransferAgreement | api/v1/users_controller.rb:323-334 (5 fields + save) | compliance record; excluded from UpdatePreferences by foundation |
| AddAuthenticationOption | `add_credential` (user.rb), omniauth link flows | |
| RemoveAuthenticationOption | authentication_options_controller#disconnect (:3-25) | |
| SetPrimaryContactInfo | disconnect replacement write (:19), update_primary_contact_info | transaction-wrapped (fixes A12 non-atomicity; documented pin exception) |
| SetUserType (UserTypeSetter) | set_user_type (registrations :386-412), wraps UpgradeToTeacher/DowngradeToStudent | returns correctly-classed object per user-sti-becomes-consistency |
| GrantPermission / RevokePermission / RevokeAllPermissions | admin_users_controller :293-341 (`@user.permission =` :301), user_permission_grantee.rb | RevokeAllPermissions carries the A2 audit fix |
| SoftDelete / Undestroy | registrations #destroy (:234, :650), `undestroy` (user.rb) | |
| Purge | wraps Purgeable concern flows | account-deletion pipeline entry |
| PasswordResetterByEmail/ByUsername, UpgradeToPersonalLogin, PiiScrubber | existing | unchanged |
| MultiAuthMigrator | after_create hook + backfill | deleted at user-single-auth-retirement G3 |

## Site classification

- registrations_controller.rb → user-write-api-registrations (7 mutation
  endpoints: update :121, set_student_information :309, set_parent_email
  :365, set_user_type :386, update_user_email :484, upgrade :322,
  destroy :234).
- omniauth_callbacks_controller.rb (non-creation writes),
  authentication_options_controller.rb, lti/v1/account_linking_controller.rb
  → user-write-api-auth-options.
- api/v1/users_controller.rb preference cluster → foundation;
  accept_data_transfer_agreement + postpone_census_banner,
  rubrics_controller, admin_users_controller (account_repair :28-38,
  permission grants :293-341), api/v1/user_school_infos_controller →
  user-write-api-misc-controllers.
- Creation sites (User.new funnels incl. followers_controller :32-56) →
  user-multi-auth-at-creation.
- Exempt: Devise-owned controllers (sessions/passwords internals),
  test_controller.rb:480 (test-env only), ability.rb:8 (unsaved
  sentinel), model-internal saves (retired progressively by the callback
  work, report recommendation 5), lib/services (already commands).

## TDD-equivalence method (binding on all per-surface changes)

1. Per endpoint, BEFORE moving code: request-level characterization tests
   capturing (a) response status and body, (b) DB row deltas on `users`
   and `authentication_options`, (c) observable side effects (mail,
   metrics, ChatClient). Matrix covers student/teacher × migrated/
   sponsored × with/without current_password wherever the endpoint
   branches on them.
2. Extraction is mechanical delegation: controller builds command args
   from (shrunken) permitted params; response shaping stays in the
   controller.
3. Characterization tests pass UNCHANGED post-extraction. The only
   allowed pin edits are enumerated per change in its design (e.g. the
   A12 atomicity fix) and each requires an explicit note.
4. Command unit tests are added after equivalence is proven, not before
   (they test the new seam, not the old behavior).

## Cop graduation

Foundation introduces `CustomCops::UserMutationOutsideService` todo-listed.
Graduation: when a surface's migration change lands, its files leave the
todo list; the cop enforces repo-wide when the three per-surface changes
plus foundation are complete. New violations are build failures from
foundation onward (todo list is frozen, additions rejected in review).
