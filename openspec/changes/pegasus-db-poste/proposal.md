# Pegasus Removal: Poste Tables to Dashboard Schema

Change 7 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 2). Moves the transactional-email tables — `contacts`,
`poste_deliveries`, `poste_messages` — to the dashboard schema,
repoints the Poste pipeline, and drops the three dead poste tables.
Highest-risk change of the series: the email queue moves under a
per-minute drain cron.

## Why

`Poste2::DeliveryMethod` is the ActionMailer delivery method in
development, staging, and production; every dashboard email inserts
into `pegasus.contacts` + `pegasus.poste_deliveries` (+
`poste_messages` template registry), and
`bin/cron/deliver_poste_messages` drains the queue every minute.
Account purging (`DeleteAccountsHelper#remove_poste_data`, nightly
`User::PiiScrubberJob`, `AccountPurger`) deletes from the same
tables. These are the last high-traffic consumers of the pegasus
schema. `poste_opens` (writer deleted with the pegasus server),
`poste_urls` and `poste_clicks` (click tracking, zero code
references after `pegasus-poste-dead-links`) are dead.

## What Changes

- New oneoff `bin/oneoff/pegasus_db_migration/move_poste_tables_to_dashboard.rb`:
  ONE atomic `RENAME TABLE` statement moving all three live tables to
  the dashboard schema, then three updatable compatibility views at
  the old names (in-flight enqueues and the drain cron keep working
  through the deploy window); `--drop-view` and `--revert` flags.
- New AR migration creating `contacts`, `poste_deliveries`,
  `poste_messages` in the dashboard schema, guarded by
  `table_exists?`; schema derived from the live tables; `schema.rb`
  updated.
- Repoint to `DASHBOARD_DB`: `lib/cdo/poste.rb` (15 sites),
  `bin/cron/deliver_poste_messages_process.rb` (6),
  `bin/cron/confirm_usage` backlog check,
  `lib/cdo/delete_accounts_helper.rb#remove_poste_data` (the
  `poste_opens` delete line is removed outright — table is dropped),
  `bin/update-contact-email`.
- Delete the `POSTE_DB` alias from `lib/cdo/db.rb` (all consumers
  repointed here) and the stale `unsent_pl_emails_{enumerate,send}.rb`
  oneoffs.
- Test infra: `SequelTestCase` and poste-touching tests
  (`test_poste`, `test_deliverer`, `poste_assertions`,
  `delete_accounts_helper_test`) wrap/point at both pools so
  rollback isolation covers the moved tables.
- `aws/dms/tasks.yml`: `pegasus.contacts`/`pegasus.poste_deliveries`
  → `dashboard.*`. DATA-TEAM GATE (Redshift schema relocation +
  re-load; purge propagation continuity).
- Ops runbook: rename → deploy → drop views; plus
  `DROP TABLE poste_opens, poste_urls, poste_clicks` (after
  data-team snapshot decision).

Depends on: `pegasus-poste-dead-links` (shrinks poste.rb first),
`pegasus-cron-detach`.

## Capabilities

### New Capabilities

- `poste-dashboard-schema`: transactional email enqueue, drain, and
  purge operate on dashboard-schema tables with identical behavior.

### Modified Capabilities

_None._

## Impact

- The email pipeline's storage moves; SMTP sending, template
  resolution, student-email scrubbing, backlog monitoring, and purge
  behavior are unchanged.
- `POSTE_DB` constant gone; `PEGASUS_DB` remains only for
  `forms`/`form_geos`/`properties` (later changes).
- External: data team re-points Redshift consumers of
  `pegasus_production_pii.{contacts,poste_deliveries}`; purge
  anonymization continues to propagate via the relocated DMS tasks.
- Rollback: `--revert` before view-drop; code revert after.
