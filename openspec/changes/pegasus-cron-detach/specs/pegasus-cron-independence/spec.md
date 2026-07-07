# pegasus-cron-independence

## ADDED Requirements

### Requirement: Cron scripts load without the pegasus library tree
Every production cron script SHALL load without requiring any file
under `lib/cdo/pegasus/`. The affected set: `update_dotd`,
`delete_twilio_data`, `hoc_student_name_cleanup`,
`deliver_poste_messages_process.rb`, `geocode_hoc_activity`,
`form_geos`, `user_geos`, `update_project_count`,
`hoc_signup_counts`, plus `bin/upload_new_census_data_to_mapbox`.

#### Scenario: no pegasus requires remain in bin
- **WHEN** `grep -rn "cdo/pegasus" bin/` runs at repo root
- **THEN** it returns no matches

#### Scenario: scripts parse
- **WHEN** `ruby -c` runs on each affected script
- **THEN** each reports valid syntax

### Requirement: Properties is served from lib/cdo/properties.rb
The `Properties` class SHALL be provided by `lib/cdo/properties.rb`,
operating on the same `properties` table with unchanged `get`/`set`/
`delete` semantics (60-second CDO.cache on reads), and SHALL NOT
define a global `DB` constant.

#### Scenario: round-trip
- **WHEN** `Properties.set('cron_detach_test', {'a' => 1})` then `Properties.get('cron_detach_test')` run in a console with only `deployment` and `cdo/properties` loaded
- **THEN** the get returns `{'a' => 1}` after cache expiry semantics identical to before

#### Scenario: no DB global
- **WHEN** `grep -rn "^DB = \|^DB=" lib/ bin/` runs
- **THEN** it returns no matches

### Requirement: The pegasus umbrella is gone
The repository SHALL NOT contain `lib/cdo/pegasus.rb`,
`lib/cdo/pegasus/src/env.rb`, `lib/cdo/pegasus/src/database.rb`,
`lib/cdo/pegasus/array.rb`, `lib/cdo/pegasus/hash.rb`, or
`lib/cdo/pegasus/file_utility.rb`; `lib/cdo/pegasus/` SHALL contain
only `graphics.rb`.

#### Scenario: directory contents
- **WHEN** `ls lib/cdo/pegasus/` runs
- **THEN** it lists exactly `graphics.rb`

### Requirement: The pegasus Rakefile works without the pegasus library tree
`pegasus/Rakefile` and `pegasus/rake/db.rake` SHALL function using
`deployment` and `cdo/db` directly, with `Sequel::Migrator` operating
on `PEGASUS_DB`.

#### Scenario: rake tasks list and version
- **WHEN** `bundle exec rake -T` and `bundle exec rake db:version` run from `pegasus/`
- **THEN** both exit zero (db:version prints the current schema version)
