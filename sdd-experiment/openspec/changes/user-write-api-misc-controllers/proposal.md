# Proposal: user-write-api-misc-controllers

Per-surface migration change under user-write-api-catalog; the closing
sweep. Depends on: user-write-api-foundation, user-write-api-catalog.
Zero user-visible impact.

## Why

After foundation (api/v1 preference setters), registrations, and
auth-options, the remaining direct User writes are scattered
singletons — individually small, collectively the reason the write cop
cannot graduate:

- admin_users_controller: `account_repair` does
  `teacher.update!(email:)` (:37); `grant_permission` does
  `@user.permission = params[:permission]` (:301); `revoke_permission`
  (:306) and `bulk_grant_permission` (:316) mutate permissions directly.
  Admin-privilege writes without a named, instrumented operation — the
  same surface as report finding A2.
- api/v1/users_controller#accept_data_transfer_agreement (:323-334) —
  five compliance fields + lenient `save`; explicitly deferred by
  foundation.
- api/v1/users_controller#postpone_census_banner (next_census_display
  serialized write) — a preference by shape; joins UpdatePreferences'
  allowlist.
- rubrics_controller#update_ai_rubrics_tour_seen (:373-379) —
  `ai_rubrics_tour_seen` flag + `save!`; teacher-guarded; also joins
  UpdatePreferences.
- api/v1/user_school_infos_controller#update (:38) —
  `current_user.update(school_info:)` plus a paired
  user_school_infos.last_confirmation_date write (:42-43).

## What Changes

- `GrantPermission` / `RevokePermission` — wrap UserPermission
  grant/revoke incl. the bulk path; emit the same audit trail the
  admin bit gets (extends user-admin-revocation-audit's principle to all
  permissions). `RevokeAllPermissions` is that change's scope; this one
  routes the admin controller through the command trio.
- `UpdateEmail` reuse — account_repair delegates to the same command
  registrations uses (admin actor noted in instrumentation).
- `AcceptDataTransferAgreement` — the five-field compliance write with
  its idempotence guard (`unless data_transfer_agreement_accepted`)
  moves in whole; save leniency preserved.
- `UpdatePreferences` allowlist grows by `next_census_display` and
  `ai_rubrics_tour_seen` (rubrics keeps its teacher? guard
  controller-side, pinned).
- `UpdateSchoolInfo` — wraps the school_info update + confirmation-date
  pair in one transaction (both already succeed-or-render today; the
  pairing is pinned).
- Closing audit: re-run the mutation-site sweep; every remaining hit is
  exempt-listed or fixed; the cop's todo list empties and it graduates
  to enforcing per the catalog spec.

## Capabilities

### New Capabilities

- `user-mutation-sweep-completion`: no direct User writes remain in
  controllers outside the enumerated exemptions; the write cop enforces.

### Modified Capabilities

- `user-write-api`: UpdatePreferences allowlist gains two attributes.

## Impact

- `dashboard/app/controllers/admin_users_controller.rb`,
  `api/v1/users_controller.rb`, `rubrics_controller.rb`,
  `api/v1/user_school_infos_controller.rb`; command additions under
  `dashboard/lib/services/user/`.
- Coordinates with user-admin-revocation-audit (shared audit mechanism)
  and user-policy-predicates (admin authorization checks).
