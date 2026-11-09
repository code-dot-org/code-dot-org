# Design: pegasus-db-properties

## Context

`Properties` (`lib/cdo/properties.rb`, relocated by
`pegasus-cron-detach`) is a get/set/delete wrapper over
`PEGASUS_DB[:properties]` (key VARCHAR unique, value JSON text) with
a 60-second CDO.cache on reads. Consumers: `geocode_hoc_activity`,
`hoc_student_name_cleanup`, `update_project_count`,
`hoc_signup_counts` (unscheduled), `bin/upload_new_census_data_to_mapbox`
— all through the class. Nothing else references the table. No DMS
replication. Dashboard schema has no `properties` table or
`Property` AR model (verified 2026-07-07).

## Goals / Non-Goals

**Goals:** table in dashboard schema; `Properties` repointed; crons
unaffected.

**Non-Goals:** changing the KV semantics, the cache TTL, or the
consumers; migrating to a Rails-native store.

## Decisions

**1. Series rename+view pattern** (see `pegasus-db-hoc` design for
the full rationale): atomic `RENAME TABLE`, updatable view at the
old name for the deploy window, `--drop-view` / `--revert` flags,
schema names from `CDO.*_db_name`, information_schema idempotence
guards.

**2. Keep the generic table name `properties`.** Verified free in
the dashboard schema. Renaming (e.g. `legacy_properties`) would
touch every consumer for zero removal value. If a future Rails
`Property` model wants the name, that future change owns the
conflict.

**3. AR migration create-if-absent from live schema** — the table is
two columns + PK + unique key; still derive from
`SHOW CREATE TABLE` rather than the pegasus migration stub
(`024_create_properties.rb`) for collation/index fidelity.

## Risks / Trade-offs

- Cron write during the rename waits on the metadata lock;
  sub-second. The 60s read cache means a stale read after cutover
  resolves itself — cursors tolerate one redundant batch
  (geocode re-processes at most one BATCH of rows, idempotent
  updates).
