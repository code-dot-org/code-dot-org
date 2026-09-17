# Design: user-write-api-registrations

## Order of work

Endpoint order is risk-ascending: set_parent_email (one field) →
set_student_information → update_user_email → update →
destroy → set_user_type (rides the heaviest callback chain). Each
endpoint is one PR: pins, delegation, green, next.

## Decisions

**D1 — current-password verification is a command precondition, not a
controller concern.** Today the split lives in `needs_password?` (:542)
choosing between Devise's `update_with_password` (verifies
current_password) and the app's `update_without_password`. Commands take
`current_password:` (nullable) plus a `require_current_password:` flag
resolved by the same predicate; the predicate's inputs
(`encrypted_password.present?`, provider state) are pinned by tests per
account shape. Behavior — which requests 422 on missing/wrong
current_password — must be byte-identical.

**D2a — field→command disposition for update_params (:572-616).**
Normative; every permitted field has exactly one home:

| Fields | Command |
|---|---|
| name, given_name, family_name, username | UpdateName |
| password, password_confirmation (current_password = gate input, not data) | UpdatePassword |
| gender, gender_student_input, races | UpdateDemographics |
| age, birthday, us_state, country_code, user_provided_us_state | UpdateAgeAndState |
| parent_email | UpdateParentEmail |
| school, full_address, school_info_attributes[...] | UpdateSchoolInfo |
| locale, ai_rubrics_disabled, lti_roster_sync_enabled | UpdatePreferences |
| educator_role, facilitator_info_attributes[bio] | UpdateEducatorProfile |
| terms_of_service_version | AcceptTermsOfService |
| provider, encrypted_password | NO command — dropped from the permit list, pending task 0.1's mitigation ruling |

The email-preference virtual attrs merged by `email_preference_params`
(:632) ride into UpdateEmail/SetUserType as an `email_preference:`
argument (they feed the EmailPreferences concern callbacks today; the
commands own that side effect explicitly).

**D2 — `update` decomposes by changed slice, atomically.** One request
may change name and password together; the controller invokes the
relevant commands inside a single transaction and merges error objects
into the same `respond_to_account_update` shape (:503). Response
equivalence (flash kind, redirect, errors JSON) is part of the pin.

**D3 — `set_user_type` keeps its guards outside the command.**
`forbidden_change?` (:532) and `can_change_own_user_type?` remain
controller-side authorization (moving to Policies::User under
user-policy-predicates); `SetUserType` owns only the transition
(delegating to UpgradeToTeacher/DowngradeToStudent, which carry the
becomes! fix). Email requirement on student→teacher is pinned.

**D4 — `UpdateEmail` owns the three-arm split.** The
migrated → `update_primary_contact_info`, else with/without-password
arms move verbatim into the command. No semantic unification in this
change; unification is user-email-source-of-truth's job (sequenced
independently; whichever lands second rebases mechanically).

**D5 — `SoftDelete` covers dependents.** `destroy_users` (:650) becomes
`SoftDelete.call(user:, dependents:)`; the dependent-selection query
(`users_to_destroy` :228) stays controller/query-object side.

## Characterization matrix (per D-method from the catalog)

Per endpoint: student/teacher × migrated/sponsored/manual ×
password-present/absent, plus the endpoint's own branches (e.g.
set_user_type with/without email supplied). Pins capture status, body
(flash/errors), users + authentication_options row deltas, and
enqueued mail. The existing suite covers parts of this
(set_user_type_test.rb:361 lines); gaps are filled before extraction.

## Rollback

Each endpoint's delegation is a small, revertable commit; commands are
additive until the endpoint flips. No data migrations anywhere in this
change.
