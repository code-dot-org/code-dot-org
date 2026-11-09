# hoc-activity-dashboard-schema

## ADDED Requirements

### Requirement: hoc_activity lives in the dashboard schema
The `hoc_activity` table SHALL exist in the dashboard schema (present
in `dashboard/db/schema.rb`), and all application reads and writes
SHALL go through `DASHBOARD_DB`.

#### Scenario: no PEGASUS_DB references remain
- **WHEN** `grep -rn "PEGASUS_DB\[:hoc_activity\]\|PEGASUS_DB.fetch" dashboard/ bin/ lib/` runs
- **THEN** it returns no matches

#### Scenario: schema.rb contains the table
- **WHEN** `grep -n 'create_table "hoc_activity"' dashboard/db/schema.rb` runs
- **THEN** it matches

### Requirement: Hour of Code tracking flows are unchanged
The begin/finish/pixel tracking and certificate name flows SHALL
behave identically against the dashboard-schema table.

#### Scenario: engine tests pass
- **WHEN** the hoc_legacy engine test suite runs
- **THEN** all tests pass with `hoc_activity` served from the dashboard schema

#### Scenario: session insert round-trip
- **WHEN** a tracking session row is created and then read back by session id in a rails console
- **THEN** the row is found with identical columns to the pre-move behavior

### Requirement: Production migration is zero-downtime and reversible
The move SHALL use an atomic `RENAME TABLE` followed by an updatable
compatibility view at the old name, with a `--revert` path, so code
deployed before and after the rename both function.

#### Scenario: old-name writes pass through during the window
- **WHEN** the rename oneoff has run and not-yet-deployed code inserts via `<pegasus>.hoc_activity`
- **THEN** the row lands in `<dashboard>.hoc_activity` (view passthrough)

#### Scenario: revert restores the original state
- **WHEN** the oneoff runs with `--revert` before the view is dropped
- **THEN** the table is back in the pegasus schema with no view present

### Requirement: DMS replicates from the new schema
`aws/dms/tasks.yml` SHALL reference `dashboard.hoc_activity` with the
same PII `remove_column` list, and SHALL NOT reference
`pegasus.hoc_activity`.

#### Scenario: config grep
- **WHEN** `grep -n "hoc_activity" aws/dms/tasks.yml` runs
- **THEN** it matches only under `dashboard.` with the remove_column block intact
