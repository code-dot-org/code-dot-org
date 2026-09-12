# Proposal: user-write-api-foundation

Foundation slice for recommendation 1 of the User Model Improvement
Report (July 2026), the write API, motivated by Addendum 2's
write-surface measurement (openspec/user-model-improvement-report-
2026-07.md:180-204, :371-380). Independent of the other user-model
changes; the per-controller migrations that follow (registrations
controller and the rest) depend on this one. Zero user-visible impact.

## Why

The User write surface is unbounded. Measured: 46 `update`/`save` call
sites across 10 controllers, 26 raw attribute setters on
`current_user`/`@user`, and permit lists that mass-assign `user_type`
itself (dashboard/app/controllers/registrations_controller.rb:303).
Consequences: any controller write fires the full 18-callback chain;
domain operations have no name in the code, so they cannot be audited,
instrumented, or reasoned about; the A2 audit gap fixed by
`user-admin-revocation-audit` is a specimen of this, not an outlier.

The densest cluster is dashboard/app/controllers/api/v1/
users_controller.rb:199-412: 18 write actions, each an assign-then-save
of one or two serialized preference flags (`using_text_mode`,
`mute_music`, `sort_by_family_name`, `has_seen_homepage_welcome`,
`display_theme`, ... — the `serialized_attrs` list at
dashboard/app/models/user.rb:221-273). Every one is a bespoke raw write.

A house pattern already exists — `Services::User::UpgradeToTeacher`,
`Services::User::PasswordResetterByEmail` on `Services::Base`
(dashboard/lib/services/base.rb) — but it is exemplary, not enforced.
Nothing stops the 47th raw call site.

## What Changes

- New `Services::User::UpdatePreferences` command with a frozen,
  explicit attribute allowlist (17 preference/UI-flag attributes). The
  18 preference actions in api/v1/users_controller.rb delegate to it
  mechanically; every response stays byte-identical, pinned by
  characterization tests written first.
- New custom RuboCop cop (house pattern: tools/customLinters/, wired
  via .config/rubocop/config.yml:8-20, run by the pre-commit hook —
  tools/hooks/lint.rb:66-67) forbidding `.update`/`.save`/
  `.update_attribute`/`.update_column`/attribute-writer calls on User
  receivers in controllers outside `Services::User`. Introduced
  todo-listed: existing violating files are enumerated as Excludes in
  .config/rubocop/todo.yml, not fixed here; new files get a hard gate.
- Instrumentation seam at the command layer: a prepended module that
  emits one `Cdo::Metrics` count per command invocation (precedent:
  password_resetter_by_email.rb:49). `UpdatePreferences` is
  instrumented; existing commands are untouched.
- Out of scope: registrations_controller and the other nine
  controllers (follow-up changes, one controller each); the
  `accept_data_transfer_agreement` and other compliance writes (a
  future named command, see design D2); any behavior change.

## Capabilities

### New Capabilities

- `user-write-api`: User mutations flow through named
  `Services::User::*` commands — allowlisted attributes, a lint gate at
  the controller boundary, and one instrumentation point per command.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- New: dashboard/lib/services/user/update_preferences.rb,
  dashboard/lib/services/user/instrumentation.rb.
- New: tools/customLinters/rubocop_user_mutation_outside_service.rb;
  edits to .config/rubocop/config.yml (require) and
  .config/rubocop/todo.yml (enumerated Excludes).
- Modified: dashboard/app/controllers/api/v1/users_controller.rb (18
  actions become one-line delegations; responses unchanged).
- Tests: new dashboard/test/lib/services/user/update_preferences_test.rb;
  characterization additions to
  dashboard/test/controllers/api/v1/users_controller_test.rb.
- No schema change, no route change, no response change.
