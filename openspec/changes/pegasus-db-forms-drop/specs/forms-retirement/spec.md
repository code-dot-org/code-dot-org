# forms-retirement

## ADDED Requirements

### Requirement: No code references the forms tables
The repository SHALL contain no code reading or writing the pegasus
`forms` or `form_geos` tables, including the geocode cron, the purge
anonymizers, the seasonal signup counter, and the unreachable
contact-rollups branches.

#### Scenario: grep gate
- **WHEN** `grep -rn "\[:forms\]\|\[:form_geos\]\|pegasus.forms\|pegasus.form_geos" --include=*.rb lib/ dashboard/ bin/ shared/` runs
- **THEN** it returns no matches

#### Scenario: cron and script files gone
- **WHEN** `test -e bin/cron/form_geos -o -e bin/cron/hoc_signup_counts` runs
- **THEN** it exits non-zero, and `crontab.erb` contains no `form_geos` entry

### Requirement: Account purge remains complete without forms anonymization
`DeleteAccountsHelper` SHALL pass its test suite with the forms
anonymization methods removed, and purging an account SHALL leave no
account-linked email PII in application databases (the forms tables
having been dropped wholesale).

#### Scenario: purge suite green
- **WHEN** the delete_accounts_helper tests run after the forms methods and their assertions are removed
- **THEN** all tests pass

### Requirement: DMS no longer replicates forms tables
`aws/dms/tasks.yml` SHALL NOT reference `forms` or `form_geos`, and
the change SHALL carry recorded data-team sign-off covering the
Redshift copies' disposition and the end of purge propagation.

#### Scenario: config grep
- **WHEN** `grep -n "forms\|form_geos" aws/dms/tasks.yml` runs
- **THEN** it returns no matches

### Requirement: The tables are dropped from the pegasus schema
The ops runbook SHALL archive (per data-team choice) and then
`DROP TABLE` `forms` and `form_geos` in the pegasus schema.

#### Scenario: post-runbook state
- **WHEN** the runbook completes and `SHOW TABLES` runs against the pegasus schema
- **THEN** neither `forms` nor `form_geos` is listed
