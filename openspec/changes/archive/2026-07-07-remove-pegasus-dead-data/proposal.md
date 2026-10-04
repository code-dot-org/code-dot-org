## Why

Pegasus is fully disabled in production. The Sinatra web server and
forms subsystem were already retired (PRs #73123, #73038). What remains
in `pegasus/data/` is 28 CSV files and a `StaticModels` system that
loaded them into the pegasus database as Sequel static-cache tables.
Every consumer of these tables was in the deleted Sinatra app — zero
runtime callsites remain. The `Donor` and `DonorSchool` ActiveRecord
models that seeded from two of the CSVs are also dead: `Donor` is never
queried, `CdoDonor` references an undefined method, and the congrats
controller hardcodes `nil` instead of pulling random donors.

This is Phase 1 of the pegasus removal plan
(`specs/pegasus-removal/plan.md`), simplified from "move data files" to
"delete dead code" after confirming zero consumers.

## What Changes

- Delete `pegasus/data/` (28 CSV files + `static_models.rb`)
- Delete `dashboard/app/models/donor.rb` and `donor_school.rb`
- Delete `lib/cdo/cdo_donor.rb`
- Remove `StaticModels` require and prepend from `lib/cdo/db.rb`
- Remove `Donor.setup` from `dashboard/lib/tasks/seed.rake`
- Remove `pegasus/rake/seed.rake` (only seeds the dead CSV tables)
- Drop `donors` and `donor_schools` tables via AR migration

## Capabilities

### New Capabilities

_None — this is pure deletion._

### Modified Capabilities

_None — no spec-level behavior changes._

## Impact

- `lib/cdo/db.rb` — two lines removed (require + prepend)
- `dashboard/lib/tasks/seed.rake` — one line removed (Donor.setup)
- `pegasus/rake/seed.rake` — file deleted
- `pegasus/data/` — directory deleted (28 CSVs + static_models.rb)
- `dashboard/app/models/donor.rb`, `donor_school.rb` — deleted
- `lib/cdo/cdo_donor.rb` — deleted
- `dashboard/db/migrate/` — new migration to drop `donors` and
  `donor_schools` tables
- Tests referencing Donor/DonorSchool need removal or update
