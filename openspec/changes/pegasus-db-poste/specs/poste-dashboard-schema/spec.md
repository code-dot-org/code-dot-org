# poste-dashboard-schema

## ADDED Requirements

### Requirement: Email pipeline operates on dashboard-schema tables
`contacts`, `poste_deliveries`, and `poste_messages` SHALL live in
the dashboard schema (present in `dashboard/db/schema.rb`), and all
enqueue, drain, monitoring, and purge code SHALL access them through
`DASHBOARD_DB`.

#### Scenario: enqueue round-trip
- **WHEN** an ActionMailer mail is delivered via `Poste2::DeliveryMethod` in a rails console
- **THEN** a contact row and a `sent_at: nil` delivery row exist in the dashboard-schema tables

#### Scenario: no pegasus references to poste tables remain
- **WHEN** `grep -rn "PEGASUS_DB\[:contacts\]\|PEGASUS_DB\[:poste\|POSTE_DB" --include=*.rb lib/ dashboard/ bin/ shared/` runs
- **THEN** it returns no matches

### Requirement: The POSTE_DB alias is removed
`lib/cdo/db.rb` SHALL NOT define `POSTE_DB`, and no code SHALL
reference it.

#### Scenario: constant gone
- **WHEN** `grep -rn "POSTE_DB" --include=*.rb --exclude-dir=.git .` runs
- **THEN** it returns no matches outside archived/openspec documents

### Requirement: Purge removes poste PII from the dashboard schema
`DeleteAccountsHelper#remove_poste_data` SHALL delete the user's
contact and delivery rows from the dashboard-schema tables and SHALL
NOT reference `poste_opens`.

#### Scenario: purge test suite
- **WHEN** the delete_accounts_helper tests covering poste data run
- **THEN** they pass against the dashboard-schema tables with no poste_opens assertions

### Requirement: Production cutover is atomic and reversible
The move SHALL rename all three tables in one atomic `RENAME TABLE`
statement, install updatable compatibility views at the old names,
and support `--revert` and `--drop-view`; enqueues and drains during
the deploy window SHALL be neither lost nor duplicated.

#### Scenario: old-name enqueue during window
- **WHEN** the rename has run and not-yet-deployed code enqueues via the pegasus-schema names
- **THEN** the delivery row lands in the dashboard-schema table and is drained normally

#### Scenario: revert
- **WHEN** `--revert` runs before views are dropped
- **THEN** all three tables are back in the pegasus schema with no views

### Requirement: Dead poste tables are dropped
`poste_opens`, `poste_urls`, and `poste_clicks` SHALL have no code
references and SHALL be dropped from the pegasus schema by the ops
runbook.

#### Scenario: no code references
- **WHEN** `grep -rn "poste_opens\|poste_urls\|poste_clicks" --include=*.rb lib/ dashboard/ bin/ shared/` runs
- **THEN** it returns no matches

### Requirement: DMS replicates poste tables from the new schema
`aws/dms/tasks.yml` SHALL reference `dashboard.contacts` and
`dashboard.poste_deliveries` and SHALL NOT reference the pegasus
schema for them.

#### Scenario: config grep
- **WHEN** `grep -n "contacts\|poste_deliveries" aws/dms/tasks.yml` runs
- **THEN** both appear only under `dashboard.`
