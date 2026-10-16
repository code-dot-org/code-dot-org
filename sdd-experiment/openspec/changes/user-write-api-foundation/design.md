# Design: user-write-api-foundation

## Context

The setter cluster (api/v1/users_controller.rb:199-412) is 18 actions
over 17 serialized attributes, in two save flavors that must be
preserved exactly:

- 12 lenient actions use `save` and render regardless of the result
  (`post_using_text_mode` :199-204, `post_mute_music` :207-212,
  `post_sort_by_family_name` :215-222, `post_ai_rubrics_disabled`
  :271-278, `post_ai_differentiation_enabled` :280-287,
  `post_disable_lti_roster_sync` :296-303, `update_display_theme`
  :306-311, `postpone_census_banner` :337-354, `dismiss_census_banner`
  :357-368, `dismiss_donor_teacher_banner` :371-379,
  `dismiss_parent_email_banner` :382-387, `verify_captcha` :403-412).
- 6 raising actions use `save!`/`update!`
  (`post_has_seen_homepage_welcome` :225-232,
  `post_has_dismissed_personalization_alert` :235-242,
  `post_teacher_onboarding_hidden` :253-260,
  `post_has_seen_ai_assessments_announcement` :289-293,
  `post_has_completed_ai_differentiation_welcome` :314-320,
  `set_seen_ta_scores` :390-398).

All 17 attributes live in the `serialized_attrs` list
(user.rb:221-273); the `before_save` properties compaction drops
falsy values from the blob. That tri-state defect is recommendation 4's
problem; this change preserves it bit-for-bit.

Infrastructure facts: `Services::Base` provides `self.call(...)` =
`new(...).call` (dashboard/lib/services/base.rb). Custom cops live in
tools/customLinters/ and are required from
.config/rubocop/config.yml:8-20; the pre-commit hook lints changed
files with `rubocop --force-exclusion` (tools/hooks/lint.rb:66-67), so
a config-level `Exclude` silences a file even when named explicitly.
.config/rubocop/todo.yml is the house ledger for known-failing,
to-be-fixed entries. `Cdo::Metrics.put('User', name, 1, {Environment:
CDO.rack_env})` is the established service-layer metric call
(password_resetter_by_email.rb:49).

## Decisions

**D1 — one command, two entry points.**
`Services::User::UpdatePreferences` takes `(user:, updates:)`, checks
every key of `updates` against a frozen allowlist before any
assignment (unknown key raises `ArgumentError`), then
`assign_attributes` + save. `call` uses `save` and returns its
boolean; `call!` uses `save!`. The two variants exist because the 18
endpoints split 12/6 between lenient and raising semantics (see
Context) and mechanical delegation must not change which exceptions
reach the dispatcher. One command rather than 18: the attributes share
identical write semantics; the endpoint is the unit of routing, not of
domain behavior.

**D2 — allowlist = single-attribute UI/preference state; compliance
stays out.** The allowlist is the 17 attributes the cluster writes:
using_text_mode, mute_music, sort_by_family_name,
has_seen_homepage_welcome, has_dismissed_personalization_alert,
teacher_onboarding_hidden, ai_rubrics_disabled,
ai_differentiation_toggled_off, has_seen_ai_assessments_announcement,
has_completed_ai_differentiation_welcome, lti_roster_sync_enabled,
display_theme, next_census_display, donor_teacher_banner_dismissed,
parent_email_banner_dismissed, seen_ta_scores_map,
last_verified_captcha_at. `accept_data_transfer_agreement` (:323-334)
is excluded: it writes a five-attribute compliance record with
cross-field validations (user.rb:378-382) and a domain name of its own
— a future `AcceptDataTransferAgreement` command, not a preference. It
remains a raw write, enumerated under the cop's todo Exclude.

**D3 — cop: heuristic receivers, controllers only, Exclude as the
todo mechanism.** `CustomCops::UserMutationOutsideService` (modeled on
tools/customLinters/rubocop_dashboard_db_usage.rb) matches send nodes
for `update update! save save! update_attribute update_column
update_columns assign_attributes toggle!` and attribute writers
(method name ending `=`) whose receiver is the `current_user` call,
the `@user`/`@current_user` ivar, a `user` lvar, or a chain rooted at
the `User` constant. Receiver identification is heuristic — RuboCop
has no type inference — so `Include` is limited to
`dashboard/app/controllers/**/*.rb` at introduction, where the 46
measured call sites live and where a `user`-named receiver is almost
always a ::User. Broadening to helpers/jobs/models is follow-up work.
Introduction is todo-listed per the task framing: current offender
files are enumerated as `Exclude` entries in todo.yml (auto-gen
style), so existing code stays silent while any *new* file fails
pre-commit immediately. Files under dashboard/lib/services/user/ are
excluded by construction (not in Include).

**D4 — instrumentation by prepend, metric only.**
`Services::User::Instrumentation`, prepended into a command class,
wraps `call`/`call!`: emit
`Cdo::Metrics.put('User', "Command/#{ClassName.demodulize}", 1,
{Environment: CDO.rack_env})` once per invocation, then `super`.
Exceptions propagate untouched; the count records attempts, not
outcomes (outcome dimensions can be added when a consumer exists).
Only `UpdatePreferences` prepends it now; retrofitting
UpgradeToTeacher and the rest is mechanical follow-up, out of scope to
keep this slice's diff inert.

**D5 — oracle: pin first, delegate second.** Characterization tests
pin status, body, and persisted attribute value for all 18 endpoints
(plus the unauthorized paths) before any controller edit, and must
pass unmodified after delegation. Command unit tests cover allowlist
rejection, both save flavors, and metric emission. That is the
whole zero-user-impact argument; no production toggle needed for a
pure refactor.

## Alternatives rejected

- **Eighteen per-action commands**: ceremony without a boundary gain;
  no shared invariant would be enforced anywhere.
- **`Severity: info` for a true warn-only cop**: info-level offenses
  do not gate `rubocop`'s exit status, and advisory output in a
  pre-commit hook is noise nobody reads. Exclude-enumeration gives the
  same silence on legacy code plus a hard gate on new code.
- **Instrumenting `Services::Base`**: would instrument every service
  (script seed, PDFs, LTI), not the User mutation surface this change
  is about.
- **Tightening strong parameters instead of commands**: fixes
  mass-assignment of `user_type` but not the unnamed-operation
  problem; writes would still scatter across controllers with no
  choke point for audit or metrics.
