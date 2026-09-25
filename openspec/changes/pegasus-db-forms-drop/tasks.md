# Tasks: pegasus-db-forms-drop

Prerequisites: `pegasus-poste-dead-links` (poste form branch gone)
and `pegasus-cron-detach` (src/database gone) merged. Execution
split for implementing agents: code tasks (2-4, 5.1) may be
implemented ahead of the gate; tasks 5.2 and 6 are BLOCKED until a
human checks 1.1 — an agent reaching them with 1.1 unchecked STOPS
and reports.

## 1. Data-team gate (decision D2)

- [ ] 1.1 MANUAL TASK — an implementing agent MUST NOT perform this:
      a human obtains and records data-team sign-off in the PR:
      (a) stop DMS replication of `pegasus.forms`/`pegasus.form_geos`;
      (b) disposition of the Redshift `pegasus_production_pii`
      copies — DROP (breaks
      `csf_workshop_attendance_view.sql`, `csf_teachers_trained.sql`,
      `school_activity_stats.sql`) or retain-frozen (data team owns
      the snapshot's purge/compliance story);
      (c) acknowledgment that purge propagation to Redshift for these
      tables ends
- [ ] 1.2 MANUAL TASK (ops): from monitoring history, note when the
      `confirm_usage` forms freshness check last passed (confirms the
      write-dead claim); record in the PR

## 2. Delete cron and scripts

- [ ] 2.1 Delete `bin/cron/form_geos`; remove its entry from
      `cookbooks/cdo-apps/templates/default/crontab.erb` (find with
      `grep -n form_geos cookbooks/cdo-apps/templates/default/crontab.erb`)
- [ ] 2.2 Delete `bin/cron/hoc_signup_counts`
- [ ] 2.3 Delete `bin/oneoff/move_census_data.rb`

## 3. Purge path

- [ ] 3.1 In `lib/cdo/delete_accounts_helper.rb`: delete
      `clean_pegasus_forms_for_user`, `clean_pegasus_forms_for_email`,
      `clean_pegasus_forms`, the form_geos anonymizer (~:548-557),
      and their call sites (~:499, ~:534; find all with
      `grep -n "clean_pegasus_forms\|form_geos" lib/cdo/delete_accounts_helper.rb`)
- [ ] 3.2 If `grep -n "@pegasus_db" lib/cdo/delete_accounts_helper.rb`
      now shows only the initializer assignment, remove the ivar and
      its `PEGASUS_DB` require-side references; if
      `remove_poste_data` still uses it (pegasus-db-poste not yet
      merged), leave the ivar and note it
- [ ] 3.3 Update `dashboard/test/helpers/delete_accounts_helper_test.rb`:
      remove forms/form_geos fixtures and assertions

## 4. Contact rollups

- [ ] 4.1 In `dashboard/app/models/contact_rollups_processed.rb`:
      delete the `'pegasus.forms'` (~:236-303) and
      `'pegasus.form_geos'` (~:319-352) branches and the constant at
      ~:32; verify unreachability first
      (`grep -n "pegasus" dashboard/lib/contact_rollups_v2.rb` shows
      no extraction)
- [ ] 4.2 Remove the corresponding cases from
      `dashboard/test/models/contact_rollups_processed_test.rb`

## 5. Library and DMS

- [ ] 5.1 Delete `lib/cdo/form.rb` (verify:
      `grep -rn "cdo/form'\|Form2" --include=*.rb . --exclude-dir=.git`
      returns nothing else)
- [ ] 5.2 (post-gate) Remove `pegasus.forms` and `pegasus.form_geos`
      from `aws/dms/tasks.yml`

## 6. Ops runbook (post-gate, in PR description)

- [ ] 6.1 Archive step per data-team choice (mysqldump to the
      designated archive location, or nothing if they chose discard)
- [ ] 6.2 `DROP TABLE <pegasus>.forms, <pegasus>.form_geos` — HUMAN
      executed, after 5.2's DMS task regeneration is live

## 7. Verify

- [ ] 7.1 From `dashboard/`:
      `bundle exec spring testunit ./test/helpers/delete_accounts_helper_test.rb`
      and `./test/models/contact_rollups_processed_test.rb` pass
- [ ] 7.2 Spec grep gates all pass
- [ ] 7.3 `./tools/hooks/pre-commit` passes
- [ ] 7.4 Chef spec if any covers crontab.erb (run
      `grep -rn form_geos cookbooks/` to confirm nothing else
      references the cron)
