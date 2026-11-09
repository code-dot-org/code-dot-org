# Pegasus Removal: hoc_activity to Dashboard Schema

Change 6 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 2). First table migration: moves `hoc_activity` from the pegasus
schema to the dashboard schema and repoints all consumers. Template
for the other tier-2 changes.

## Why

The `hoc_legacy` engine (Hour of Code tracking + certificates —
live production controller routes) and two production crons read and
write `pegasus.hoc_activity` through `PEGASUS_DB`. The pegasus
database cannot retire while they do. The pegasus and dashboard
"databases" are sibling schemas on the same Aurora cluster (proven:
the channels migration did a cross-schema `RENAME TABLE` in
production), so the move is an atomic rename plus a code repoint —
no copy, no dual-write.

## What Changes

- New oneoff `bin/oneoff/pegasus_db_migration/move_hoc_activity_to_dashboard.rb`:
  `RENAME TABLE <pegasus>.hoc_activity TO <dashboard>.hoc_activity`,
  then `CREATE VIEW <pegasus>.hoc_activity AS SELECT *` (updatable
  MySQL view — in-flight old code keeps reading AND writing through
  it during the deploy window); `--revert` inverts. Modeled on the
  channels-era `move_user_storage_ids_to_dashboard.rb` (in git
  history; pattern reproduced in design.md).
- New AR migration creating `hoc_activity` in the dashboard schema
  guarded by `table_exists?` — a no-op on prod/staging (where ops ran
  the rename first) and the creator on dev/test/CI. Schema derived
  from the live table, not from the pegasus migration stubs.
  `schema.rb` gains the table.
- Repoint code from `PEGASUS_DB` to `DASHBOARD_DB`:
  `hoc_legacy` engine (`session_manageable.rb:43,60`,
  `certificates_controller.rb:28,45`), crons
  `bin/cron/geocode_hoc_activity`, `bin/cron/hoc_student_name_cleanup`.
- `aws/dms/tasks.yml`: `pegasus.hoc_activity` → `dashboard.hoc_activity`
  (keeping its `remove_column` PII block). DATA-TEAM GATE: the
  replicated table's Redshift home moves from `pegasus_production_pii`
  to `dashboard_production_pii`; downstream views/dashboards must
  re-point.
- RuboCop: drop the `dashboard/engines/hoc_legacy/` exclusion from
  `CustomCops/PegasusDbUsage`; satisfy the sibling
  `DashboardDbUsage` cop for the new callsites per its rules.

Depends on: `pegasus-cron-detach` (crons already require `cdo/db`
directly and use explicit `PEGASUS_DB`).

## Capabilities

### New Capabilities

- `hoc-activity-dashboard-schema`: `hoc_activity` lives in the
  dashboard schema; all reads/writes go through `DASHBOARD_DB`; the
  Hour of Code tracking/certificate flows behave identically.

### Modified Capabilities

_None._

## Impact

- 4 production code sites + 2 crons repointed; 1 oneoff + 1 AR
  migration added; DMS config edited.
- Runtime behavior identical (same rows, same SQL, different schema
  qualifier).
- Ops runbook (design.md): rename → deploy → drop view; revert path
  at each step.
- External: data team re-points Redshift consumers of
  `pegasus_production_pii.hoc_activity`.
