# Tasks: pegasus-db-properties

Prerequisite: `pegasus-cron-detach` merged (`Properties` lives at
`lib/cdo/properties.rb` on `PEGASUS_DB`).

## 1. Migration tooling

- [ ] 1.1 Create `bin/oneoff/pegasus_db_migration/move_properties_to_dashboard.rb`
      (series pattern: atomic rename, `CREATE VIEW` at old name,
      `--drop-view`, `--revert`, `CDO.*_db_name` schema names,
      information_schema guards, statement echo)
- [ ] 1.2 `SHOW CREATE TABLE <pegasus_dev>.properties`; write the
      guarded AR migration (`return if table_exists?(:properties)`)
      matching it exactly; commit `schema.rb` diff
- [ ] 1.3 Local dual-path test: oneoff-then-migrate (no-op) and
      migrate-alone (creates)

## 2. Repoint

- [ ] 2.1 `lib/cdo/properties.rb`:
      `@@table = PEGASUS_DB[:properties]` →
      `@@table = DASHBOARD_DB[:properties]`; swap the
      `PegasusDbUsage` cop comments for whatever
      `rubocop_dashboard_db_usage.rb` requires
- [ ] 2.2 Grep gate: `grep -rn "PEGASUS_DB\[:properties\]" --include=*.rb .`
      returns nothing

## 3. Verify

- [ ] 3.1 `cd lib && bundle exec ruby -Itest test/cdo/test_properties.rb`
      passes
- [ ] 3.2 Round-trip from `dashboard/`:
      `bin/rails runner 'Properties.set("opsx_test", 1); puts Properties.get("opsx_test").inspect; Properties.delete("opsx_test")'`
      prints `1`
- [ ] 3.3 `ruby -c` on the four cron consumers (no edits expected —
      confirm none reference the table directly:
      `grep -n "properties" bin/cron/geocode_hoc_activity bin/cron/hoc_student_name_cleanup bin/cron/update_project_count bin/cron/hoc_signup_counts`
      shows only `Properties.` calls)
- [ ] 3.4 `./tools/hooks/pre-commit` passes
- [ ] 3.5 PR includes the series runbook (rename → deploy →
      drop-view)
