# Tasks: pegasus-db-hoc

Prerequisite: `pegasus-cron-detach` merged (the crons use explicit
`PEGASUS_DB` and require `cdo/db` directly).

## 1. Migration tooling

- [ ] 1.1 Create `bin/oneoff/pegasus_db_migration/move_hoc_activity_to_dashboard.rb`
      per design.md decision 1: requires `deployment` + `cdo/db`;
      flags `--revert` and `--drop-view`; schema names from
      `CDO.pegasus_db_name`/`CDO.dashboard_db_name`; default action =
      rename + create view; `--drop-view` = drop the compat view;
      `--revert` = drop view (if present) + rename back; idempotence
      guards (check `information_schema` for current location before
      acting); prints each statement before running
- [ ] 1.2 Derive the live schema: run
      `SHOW CREATE TABLE <pegasus_dev>.hoc_activity` via
      `./bin/mysql-client-dashboard-reader` (or rails runner with
      PEGASUS_DB) and save the output into the migration-writing step
- [ ] 1.3 Create the AR migration in `dashboard/db/migrate/`:
      `create_table :hoc_activity` matching 1.2's columns, types,
      defaults, and indexes exactly; first line
      `return if table_exists?(:hoc_activity)`; no `down` beyond
      `drop_table` guarded the same way
- [ ] 1.4 Locally: run the oneoff against the dev DBs (rename +
      view), then `bin/rails db:migrate` (must no-op), then
      `--drop-view`; separately, on a recreated dev DB pair, run
      `db:migrate` alone (must create) — both paths leave a usable
      `dashboard.hoc_activity`; commit the `schema.rb` diff

## 2. Repoint code

- [ ] 2.1 `dashboard/engines/hoc_legacy/app/services/concerns/hoc_legacy/session_manageable.rb`
      lines ~43, ~60: `PEGASUS_DB` → `DASHBOARD_DB`
- [ ] 2.2 `dashboard/engines/hoc_legacy/app/controllers/hoc_legacy/certificates_controller.rb`
      lines ~28, ~45: same
- [ ] 2.3 `bin/cron/geocode_hoc_activity`: `PEGASUS_DB.fetch(` and
      `PEGASUS_DB[:hoc_activity]` → `DASHBOARD_DB...` (the
      `Properties` cursor lines stay untouched)
- [ ] 2.4 `bin/cron/hoc_student_name_cleanup`: repoint its
      hoc_activity dataset references (find with
      `grep -n "hoc_activity" bin/cron/hoc_student_name_cleanup`);
      `Properties` cursor lines stay
- [ ] 2.5 RuboCop: remove `dashboard/engines/hoc_legacy/` from the
      excluded paths in
      `tools/customLinters/rubocop_pegasus_db_usage.rb`; read
      `tools/customLinters/rubocop_dashboard_db_usage.rb` and satisfy
      it for the new DASHBOARD_DB callsites per its own rules (path
      allowlist entry or inline disable, matching existing usage)

## 3. DMS

- [ ] 3.1 MANUAL TASK — STOP HERE. An implementing agent MUST NOT
      proceed past this checkbox: report status and wait for a human
      to (a) obtain data-team confirmation of the Redshift
      relocation of `hoc_activity` from `pegasus_production_pii` to
      `dashboard_production_pii`, (b) schedule the DMS task
      re-generation + full re-load, and (c) record the sign-off in
      the PR and check this box. Tasks 3.2+ resume only after.
- [ ] 3.2 In `aws/dms/tasks.yml`, move the `pegasus.hoc_activity`
      entry (with its full `remove_column` block) to
      `dashboard.hoc_activity`, keeping list ordering conventions

## 4. Verify

- [ ] 4.1 Engine tests: run the hoc_legacy suite (find it:
      `ls dashboard/engines/hoc_legacy/test` or grep
      `dashboard/test` for hoc_legacy) via
      `bundle exec spring testunit <paths>` — all pass
- [ ] 4.2 Console round-trip from `dashboard/`:
      `bin/rails runner 'id = DASHBOARD_DB[:hoc_activity].insert(session: "opsx-test", started_at: Time.now); puts DASHBOARD_DB[:hoc_activity].where(id: id).count; DASHBOARD_DB[:hoc_activity].where(id: id).delete'`
      prints 1 (adjust required columns to the real schema from 1.2)
- [ ] 4.3 `ruby -c` on both crons passes;
      grep gate: `grep -rn "PEGASUS_DB" dashboard/engines/ bin/cron/geocode_hoc_activity bin/cron/hoc_student_name_cleanup`
      matches only `Properties`-related lines (none for hoc_activity)
- [ ] 4.4 View-window test (local): re-run the oneoff rename+view on
      a scratch copy, insert through the old-schema name via
      `PEGASUS_DB[:hoc_activity].insert(...)` in a console, confirm
      the row lands in the dashboard table; then `--drop-view`
- [ ] 4.5 `./tools/hooks/pre-commit` passes
- [ ] 4.6 PR includes the ops runbook (design.md decision 2) verbatim
