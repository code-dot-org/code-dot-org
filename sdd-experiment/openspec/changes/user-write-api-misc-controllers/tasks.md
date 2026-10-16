# Tasks: user-write-api-misc-controllers

Last of the per-surface changes; lands after registrations and
auth-options so the closing sweep is meaningful.

## 0. Blocking asks

- [ ] 0.1 **DECISION (blocking)**: account_repair changes a teacher's
      email with no password verification. Wrapping it in
      UpdateEmail(actor_mode: :admin) codifies that. Bless (default:
      keep, it is an admin support tool behind admin auth) or kill
      (require a re-auth/sudo step). Owner: security + support-tools
      owner.

## 1. Pins

- [ ] 1.1 Enumerate EVERY action in admin_users_controller.rb (580
      lines — grant/revoke/bulk/account_repair/delete_progress and the
      rest); classify each write per proposal; then pin the admin
      permission endpoints incl. current audit-message behavior
- [ ] 1.2 accept_data_transfer_agreement (first + repeat),
      postpone_census_banner, rubrics tour-seen (teacher + student
      actor), user_school_infos update (complete/incomplete matrix)

## 2. Commands

- [ ] 2.1 GrantPermission/RevokePermission (+ audit emission per design
      D1); delegate admin_users_controller; model writers become shims
- [ ] 2.2 AcceptDataTransferAgreement; delegate api/v1 endpoint
- [ ] 2.3 UpdatePreferences allowlist += next_census_display,
      ai_rubrics_tour_seen; delegate the two endpoints
- [ ] 2.4 UpdateSchoolInfo (transactional pair); delegate
      user_school_infos#update; account_repair → UpdateEmail
- [ ] 2.5 Re-run mutation inventory; classify stragglers; empty the cop
      todo list; flip cop to enforcing

## 3. Verify

- [ ] 3.1 Pin suites pass unchanged; `./tools/hooks/pre-commit` clean
- [ ] 3.2 Grep-audit: zero non-exempt `\.(update|save|update_attribute)`
      on User receivers in app/controllers
