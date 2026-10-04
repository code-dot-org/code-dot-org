# Pegasus Removal: properties Table to Dashboard Schema

Change 8 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 2). Moves the `properties` KV table to the dashboard schema.

## Why

After `pegasus-cron-detach`, the `Properties` class
(`lib/cdo/properties.rb`) is the sole consumer of
`pegasus.properties` — cron self-state: the geocode cursor
(`hoc_activity.last_id`), the name-cleanup cursor, the weekly
`:metrics` blob, and seasonal `hoc_signup_*` counters. It is the
last pegasus-schema table with a live writer besides the poste and
forms sets, and blocks `pegasus-db-retire`.

## What Changes

- New oneoff `bin/oneoff/pegasus_db_migration/move_properties_to_dashboard.rb`:
  `RENAME TABLE <pegasus>.properties TO <dashboard>.properties` +
  updatable compatibility view + `--drop-view`/`--revert` (series
  pattern, established in `pegasus-db-hoc`).
- New guarded AR migration creating `properties` in the dashboard
  schema for dev/test/CI; `schema.rb` updated.
- `lib/cdo/properties.rb`: `PEGASUS_DB[:properties]` →
  `DASHBOARD_DB[:properties]` (one line + cop comment swap).
- No DMS entry exists for `properties`; nothing to coordinate.

Depends on: `pegasus-cron-detach`.

## Capabilities

### New Capabilities

- `properties-dashboard-schema`: the `Properties` KV wrapper operates
  on the dashboard schema with unchanged get/set/delete semantics.

### Modified Capabilities

_None._

## Impact

- One class repointed; four cron consumers unaffected (they call
  `Properties`, not the table).
- Table name `properties` verified free in the dashboard schema (no
  AR model/table collision).
- Runbook: rename → deploy → drop view, same as the series pattern.
