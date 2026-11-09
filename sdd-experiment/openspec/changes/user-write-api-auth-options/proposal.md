# Proposal: user-write-api-auth-options

Per-surface migration change under user-write-api-catalog. Depends on:
user-write-api-foundation, user-write-api-catalog. Zero user-visible
impact (one enumerated exception: a transaction around a today-non-atomic
pair, below).

## Why

Credential mutations are scattered across three controllers and two
model-side helpers, all writing User/AuthenticationOption state directly:

- authentication_options_controller#disconnect (:3-25) destroys an auth
  option and, when it was primary, picks a replacement and
  `current_user.update! primary_contact_info:` (:19) — partially inside
  a transaction, but the related `update_primary_contact_info` model
  path (user.rb:763-772) saves then `destroy_all`s other email options
  non-atomically (report finding A12: a failure between the two leaves
  orphan options).
- omniauth_callbacks_controller's linking/credential paths call
  `add_credential` and `update_oauth_credential_tokens`
  (user_multi_auth_helper.rb:50-83), the latter carrying a
  migrated/unmigrated dual path plus a Clever legacy-id lookup (:56-72).
- lti/v1/account_linking_controller `current_user.save!` (:70) after
  mutating auth state.

These are the most security-sensitive writes in the app and the least
nameable: no single point exists to audit "credential added/removed" or
"primary contact changed."

## What Changes

- `RemoveAuthenticationOption` — wraps disconnect's destroy + (when
  primary) replacement selection; whole operation in one transaction.
- `SetPrimaryContactInfo` — wraps primary swap + cleanup of superseded
  email options; transaction-wrapped. This deliberately fixes A12's
  non-atomicity: the sole permitted pin deviation in this change, on the
  grounds that no caller can observe the intermediate state except
  during a mid-operation crash, which today produces orphans.
- `AddAuthenticationOption` — wraps `add_credential` and the omniauth
  linking writes, including oauth token refresh
  (`update_oauth_credential_tokens` moves in verbatim, dual path and
  Clever legacy-id lookup intact — deleting the dual path is
  user-single-auth-retirement's job; callers stop seeing it now).
- The LTI account-linking save routes through the same commands.
- Every command emits the foundation's instrumentation event, giving
  credential changes an audit trail for the first time.

## Capabilities

### New Capabilities

- `user-credential-mutation`: authentication options and primary-contact
  state change only through named, transactional, instrumented commands.

### Modified Capabilities

<!-- none -->

## Impact

- `dashboard/app/controllers/authentication_options_controller.rb`,
  `omniauth_callbacks_controller.rb` (linking paths only — creation is
  user-multi-auth-at-creation's scope),
  `lti/v1/account_linking_controller.rb`,
  `dashboard/lib/user_multi_auth_helper.rb` (token-update body moves),
  user.rb credential helpers become delegating shims.
- New request-level characterization tests per provider
  (google/clever/email) × migrated/unmigrated.
