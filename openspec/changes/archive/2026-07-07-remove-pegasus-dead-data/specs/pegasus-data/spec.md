## REMOVED Requirements

### Requirement: Pegasus CSV static models
The system loaded 28 CSV files from `pegasus/data/` into `PEGASUS_DB`
as Sequel static-cache tables via the `StaticModels` module. These
tables (`cdo_languages`, `cdo_donors`, `cdo_partners`, etc.) were
queried by the now-deleted Sinatra app.

**Reason**: Zero runtime consumers. The Sinatra app is retired.
**Migration**: None required — no code references these tables.

#### Scenario: Boot without StaticModels
- **WHEN** the Rails app boots without the `StaticModels` prepend on `PEGASUS_DB`
- **THEN** `PEGASUS_DB[:hoc_activity]` and all other non-CSV table access SHALL continue to work unchanged

### Requirement: Donor and DonorSchool AR models
The `Donor` and `DonorSchool` ActiveRecord models seeded dashboard DB
tables from `pegasus/data/cdo-donors.csv` and
`pegasus/data/cdo-donor-schools.csv`. The `CdoDonor` helper provided
weighted random donor selection for certificates.

**Reason**: Zero runtime queries. `CdoDonor.all_donors` is undefined
(would crash if called). Congrats controller hardcodes `nil` instead
of pulling random donors.
**Migration**: None required — no code queries these models.

#### Scenario: Congrats page without Donor model
- **WHEN** a user visits the congrats page
- **THEN** the page SHALL render with `random_donor_twitter = nil` and `random_donor_name = nil` (current behavior, unchanged)

#### Scenario: Seed task without Donor.setup
- **WHEN** `bundle exec rake seed` runs
- **THEN** seeding SHALL complete without error (Donor.setup line removed)
