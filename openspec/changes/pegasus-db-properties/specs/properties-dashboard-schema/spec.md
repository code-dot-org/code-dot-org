# properties-dashboard-schema

## ADDED Requirements

### Requirement: The properties table lives in the dashboard schema
The `properties` table SHALL exist in the dashboard schema (present
in `dashboard/db/schema.rb`), and the `Properties` class SHALL
access it through `DASHBOARD_DB`.

#### Scenario: get/set round-trip
- **WHEN** `Properties.set('opsx_test', {'v' => 1})` then `Properties.get('opsx_test')` run in a rails console
- **THEN** the get returns `{'v' => 1}` from the dashboard-schema table

#### Scenario: no pegasus reference remains
- **WHEN** `grep -rn "PEGASUS_DB\[:properties\]" --include=*.rb .` runs at repo root
- **THEN** it returns no matches

### Requirement: Migration follows the series rename+view pattern
The move SHALL use an atomic `RENAME TABLE` with an updatable
compatibility view at the old name and `--revert`/`--drop-view`
flags, so pre- and post-deploy code both function.

#### Scenario: old-name write during window
- **WHEN** the rename has run and not-yet-deployed code sets a key via the pegasus-schema name
- **THEN** the row lands in the dashboard-schema table

#### Scenario: cron consumers unaffected
- **WHEN** `bin/cron/update_project_count` logic reads and writes `:metrics` via `Properties` after cutover
- **THEN** values round-trip identically to pre-move behavior
