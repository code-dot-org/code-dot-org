# pegasus-db-retired

## ADDED Requirements

### Requirement: No code references the pegasus database
The repository SHALL contain no reference to `PEGASUS_DB`, the
`pegasus_db_name`/`pegasus_db_reader`/`pegasus_db_writer` config
keys, or the `USE_PEGASUS_UNITTEST_DB` environment variable, outside
the inert `pegasus/` directory itself (deleted by the next change).

#### Scenario: grep gate
- **WHEN** `grep -rn "PEGASUS_DB\|pegasus_db_\|USE_PEGASUS_UNITTEST_DB" --include=*.rb --include=*.erb --include=*.yml --include=*.yaml lib/ dashboard/ bin/ shared/ config* .github/ tools/ k8s/` runs
- **THEN** it returns no matches

#### Scenario: rails boots and connects only to dashboard
- **WHEN** `bin/rails runner 'puts DASHBOARD_DB.tables.any?'` runs from `dashboard/`
- **THEN** it prints `true` with no pegasus pool constructed (no `PEGASUS_DB` constant defined)

### Requirement: Build and test pipelines skip pegasus entirely
Build, install, unit-test rake tasks, and CI workflows SHALL neither
create, migrate, nor test a pegasus schema, and the wrapped
dashboard/lib/shared test tasks SHALL run exactly as before the
unwrap.

#### Scenario: task list clean
- **WHEN** `bundle exec rake --tasks 2>/dev/null | grep -i pegasus` runs at repo root
- **THEN** it returns no matches

#### Scenario: dashboard suite green
- **WHEN** the dashboard unit-test suite runs after the test.rake unwrap
- **THEN** it passes without a pegasus_test or pegasus_unittest schema existing

### Requirement: The PegasusDbUsage cop is removed
`tools/customLinters/rubocop_pegasus_db_usage.rb` SHALL be deleted
along with every `CustomCops/PegasusDbUsage` disable/enable comment.

#### Scenario: cop gone
- **WHEN** `grep -rn "PegasusDbUsage" --exclude-dir=.git .` runs
- **THEN** it returns no matches, and `bundle exec rubocop --list-target-files >/dev/null` exits zero

### Requirement: Production pegasus schemas are dropped by runbook
The ops runbook SHALL verify a quiet period with zero pegasus-schema
connections, drop leftover compatibility views, drop the pegasus
schemas, and sweep stale chef globals.

#### Scenario: post-runbook state
- **WHEN** the runbook completes and `SHOW DATABASES` runs on the production cluster
- **THEN** no `pegasus_production` schema exists
