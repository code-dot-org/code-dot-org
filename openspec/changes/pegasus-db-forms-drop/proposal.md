# Pegasus Removal: forms/form_geos Archive-and-Drop

Change 9 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 2). Retires the read-only remnants of the deleted forms
subsystem: the `forms` and `form_geos` tables and every code path
that still touches them. GATED on data-team sign-off (decision D2).

## Why

The forms subsystem (pegasus's survey/signup storage) was retired
with the pegasus server; nothing has written a `forms` row since.
What remains is inertia: a per-minute geocode cron that finds no work
(`bin/cron/form_geos`), purge-path anonymizers
(`clean_pegasus_forms*`), unreachable `'pegasus.forms'` branches in
contact rollups (the collector never extracts pegasus sources —
verified), a seasonal script (`hoc_signup_counts`, not in the
crontab, reading forms via a config key that no longer exists), and
DMS replication feeding Redshift views over frozen data. Dropping
the tables scrubs their PII wholesale — strictly stronger than the
row-level anonymizers it deletes.

## What Changes

- **HUMAN GATE (data team, decision D2):** sign-off that (a) DMS
  stops replicating `pegasus.forms`/`pegasus.form_geos`, (b) the
  Redshift copies in `pegasus_production_pii` are either dropped
  (breaking three in-repo views:
  `aws/redshift/views/csf_workshop_attendance_view.sql`,
  `csf_teachers_trained.sql`, `tables/school_activity_stats.sql` —
  historical CSF workshop reporting) or explicitly retained as a
  frozen snapshot with the data team owning its purge story (purge
  propagation via DMS ends either way).
- Delete `bin/cron/form_geos` and its crontab.erb entry.
- Delete `bin/cron/hoc_signup_counts` (unscheduled; depends on the
  undefined `CDO.pegasus_reporting_db_reader`).
- `lib/cdo/delete_accounts_helper.rb`: delete
  `clean_pegasus_forms_for_user`, `clean_pegasus_forms_for_email`,
  `clean_pegasus_forms`, the `form_geos` anonymizer, their call
  sites, and the now-unused `@pegasus_db` ivar if nothing else uses
  it.
- `dashboard/app/models/contact_rollups_processed.rb`: delete the
  unreachable `'pegasus.forms'`/`'pegasus.form_geos'` branches
  (~:235-352) and their tests.
- Delete `lib/cdo/form.rb` (last requirer died in
  `pegasus-cron-detach`) and `bin/oneoff/move_census_data.rb`'s
  forms reference (delete the oneoff).
- `aws/dms/tasks.yml`: remove the `pegasus.forms` and
  `pegasus.form_geos` entries.
- Ops runbook: archive per data-team choice, then
  `DROP TABLE forms, form_geos` in the pegasus schema.

Depends on: `pegasus-poste-dead-links` (poste's form branch already
gone), `pegasus-cron-detach` (src/database's `cdo/form` require
gone). Independent of `pegasus-db-poste` ordering.

## Capabilities

### New Capabilities

- `forms-retirement`: no code references the forms tables; account
  purging no longer needs forms anonymization because the tables are
  gone.

### Modified Capabilities

_None._

## Impact

- Production behavior: one cron stops running (it has been a no-op
  loop), purge output loses two log lines, contact rollups unchanged
  (branches were unreachable).
- Redshift: the CSF-workshop historical views break unless the data
  team retains the frozen copies — their call, recorded in the gate.
- After this + `pegasus-db-poste` + `pegasus-db-hoc` +
  `pegasus-db-properties`, the pegasus schema has zero live tables:
  `pegasus-db-retire` unblocks.
