# Tasks: pegasus-db-poste

Prerequisites: `pegasus-poste-dead-links` and `pegasus-cron-detach`
merged. Verify `lib/cdo/poste.rb` no longer contains unsubscribe/
encrypt/url machinery before starting.

## 1. Migration tooling

- [ ] 1.1 Create `bin/oneoff/pegasus_db_migration/move_poste_tables_to_dashboard.rb`
      per design.md decisions 1-2: single atomic
      `RENAME TABLE <p>.contacts TO <d>.contacts, <p>.poste_deliveries TO <d>.poste_deliveries, <p>.poste_messages TO <d>.poste_messages`;
      three `CREATE VIEW <p>.<t> AS SELECT * FROM <d>.<t>`;
      `--drop-view`, `--revert`; schema names from
      `CDO.pegasus_db_name`/`CDO.dashboard_db_name`;
      information_schema idempotence guards; prints statements
- [ ] 1.2 `SHOW CREATE TABLE` for `contacts`, `poste_deliveries`,
      `poste_messages` from the local pegasus dev DB; save outputs
- [ ] 1.3 AR migration creating the three tables (columns, defaults,
      indexes exact per 1.2), each guarded
      `next if table_exists?(...)`; commit `schema.rb` diff
- [ ] 1.4 Local dual-path test as in the hoc change: oneoff-then-
      migrate (no-op) and migrate-alone (creates); both leave working
      tables

## 2. Repoint code

- [ ] 2.1 `lib/cdo/poste.rb`: replace all `POSTE_DB` references
      (15; find with `grep -n POSTE_DB lib/cdo/poste.rb`) with
      `DASHBOARD_DB`; add the `rubocop` disable/enable comments the
      DashboardDbUsage cop requires (check
      `tools/customLinters/rubocop_dashboard_db_usage.rb` rules)
- [ ] 2.2 `bin/cron/deliver_poste_messages_process.rb`: replace its 6
      `POSTE_DB` references with `DASHBOARD_DB`
- [ ] 2.3 `bin/cron/confirm_usage`: change the `poste_deliveries`
      backlog check (~:74-75) and any CREATED/KEY_VALUE tuple using
      PEGASUS_DB for poste tables to `DASHBOARD_DB`
- [ ] 2.4 `lib/cdo/delete_accounts_helper.rb#remove_poste_data`
      (~:267-276): use `DASHBOARD_DB` for contacts +
      poste_deliveries; DELETE the `poste_opens` line (~:274)
      entirely; keep `@pegasus_db` ivar (still used by
      `clean_pegasus_forms*`)
- [ ] 2.5 `bin/update-contact-email`: inspect and repoint its
      contacts access to `DASHBOARD_DB`
- [ ] 2.6 Delete `bin/oneoff/unsent_pl_emails_enumerate.rb` and
      `bin/oneoff/unsent_pl_emails_send.rb`
- [ ] 2.7 Remove `POSTE_DB = PEGASUS_DB` from `lib/cdo/db.rb` (~:8);
      update `tools/customLinters/rubocop_pegasus_db_usage.rb` if its
      pattern names POSTE_DB
- [ ] 2.8 Grep gate: `grep -rn "POSTE_DB" --include=*.rb --exclude-dir=.git .`
      returns nothing

## 3. Test infra

- [ ] 3.1 `lib/test/sequel_test_case.rb`: wrap the run in nested
      `PEGASUS_DB.transaction(rollback: :always, auto_savepoint: true)`
      and `DASHBOARD_DB.transaction(...)` (replacing the single
      `Sequel::Model.db` wrap), mirroring
      `shared/test/common_test_helper.rb:102-103`
- [ ] 3.2 `shared/test/test_poste.rb`: repoint its 19 POSTE_DB refs
      to DASHBOARD_DB
- [ ] 3.3 `lib/test/test_deliverer.rb` (2 refs),
      `dashboard/test/testing/poste_assertions.rb` (1 ref): repoint
- [ ] 3.4 `dashboard/test/helpers/delete_accounts_helper_test.rb`:
      update poste-table setup/assertions to DASHBOARD_DB; remove
      poste_opens fixtures/assertions

## 4. DMS

- [ ] 4.1 HUMAN GATE (data team): sign-off covering (a) Redshift
      relocation of contacts + poste_deliveries to
      `dashboard_production_pii`, (b) re-load scheduling and the
      purge-propagation gap window until the new task is live,
      (c) snapshot-vs-discard for poste_opens/poste_urls/poste_clicks
      before DROP
- [ ] 4.2 `aws/dms/tasks.yml`: move `pegasus.contacts` and
      `pegasus.poste_deliveries` entries to `dashboard.`

## 5. Verify

- [ ] 5.1 `cd shared && bundle exec ruby -Itest test/test_poste.rb`
      passes
- [ ] 5.2 `cd lib && bundle exec ruby -Itest test/test_deliverer.rb`
      passes
- [ ] 5.3 From `dashboard/`:
      `bundle exec spring testunit ./test/helpers/delete_accounts_helper_test.rb`
      passes
- [ ] 5.4 Enqueue round-trip from `dashboard/`:
      `bin/rails runner 'ActionMailer::Base.mail(to: "t@example.com", from: "noreply@code.org", subject: "t", body: "b").deliver_now; puts DASHBOARD_DB[:poste_deliveries].where(sent_at: nil).count'`
      prints ≥1
- [ ] 5.5 View-window test (local): with rename+views applied and the
      pre-change code checked out in a second console, enqueue via
      the old names and confirm the row lands in the dashboard table
- [ ] 5.6 `ruby -c` on both crons; spec grep gates all pass
- [ ] 5.7 `./tools/hooks/pre-commit` passes
- [ ] 5.8 PR includes the ops runbook (design.md decision 2) and the
      post-deploy watch list: `Custom/Poste/{Sent,Abandoned,Queued}`
      OTel metrics steady across the cutover
