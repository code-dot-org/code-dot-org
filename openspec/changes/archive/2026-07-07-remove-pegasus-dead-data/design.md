## Context

Pegasus data CSVs were loaded into `PEGASUS_DB` as Sequel static-cache
models at boot via `StaticModels` (prepended in `lib/cdo/db.rb`). The
Sinatra app queried these tables; dashboard never did. The Sinatra app
is deleted. Two dashboard AR models (`Donor`, `DonorSchool`) seed from
two of the CSVs but are never queried at runtime.

## Goals / Non-Goals

**Goals:**
- Delete all dead pegasus data code with zero production impact
- Reduce `pegasus/` toward eventual full removal

**Non-Goals:**
- Migrating PEGASUS_DB tables (Phase 5, separate change)
- Deleting the `pegasus/` directory itself (Phase 3, depends on
  cache and rake task changes)
- Removing the `pegasus_dir()` helper or `PEGASUS_DB` connection
  (still has other consumers)

## Decisions

**1. Delete rather than move the CSVs**

The CSVs have zero runtime consumers. `StaticModels` loads them into
pegasus DB tables but nothing queries those tables. Moving them
somewhere would preserve dead code.

Alternative: move to `lib/cdo/data/` in case something needs them
later. Rejected — YAGNI, and they're in git history if ever needed.

**2. Drop `donors` and `donor_schools` AR tables**

These tables exist in `dashboard_db`, seeded by `Donor.setup`. No
controller, helper, or view queries them. The `CdoDonor` helper
references an undefined `all_donors` method — it would crash if
called. The congrats controller hardcodes `@random_donor_twitter = nil`
rather than pulling from the table.

The migration is a simple `drop_table :donors; drop_table
:donor_schools`.

Alternative: leave tables in place, only delete Ruby code. Rejected —
orphaned tables accumulate confusion and the migration is trivial to
write.

**3. Remove `StaticModels` entirely**

`static_models.rb` defines the `StaticModels` module, prepended onto
`PEGASUS_DB` in `lib/cdo/db.rb`. It intercepts `PEGASUS_DB[:table_name]`
to return static-cached Sequel models for CSV-derived tables. No code
calls `PEGASUS_DB[:cdo_*]` anywhere. Removing the prepend has no
effect on `PEGASUS_DB[:hoc_activity]` or other non-CSV table access
because `StaticModels#[]` falls through to `super` for unknown tables.

**4. Single PR**

All deletions are independent and low-risk. A single PR keeps the
change atomic and reviewable.

## Risks / Trade-offs

**[Risk] Unknown consumer of CSV data we missed** → Mitigated by
grep-based exhaustive search confirming zero hits for all 27 table
names (both snake_case and CamelCase forms) outside pegasus/ and
tests. Also confirmed `CdoDonor.all_donors` is undefined — any call
would crash, meaning it hasn't been called in production.

**[Risk] Seed task removal breaks test setup** → `Donor.setup` is
called from `dashboard/lib/tasks/seed.rake`. If any test depends on
seeded donor data, it will fail. Mitigated by searching for test
references and updating them in the same PR.

**[Risk] `StaticModels` prepend removal changes `PEGASUS_DB[:x]`
behavior for non-CSV tables** → No. `StaticModels#[]` checks
`@csv_tables.include?(table)` and returns `super` for non-CSV tables.
Removing the prepend just removes the check — same result.
