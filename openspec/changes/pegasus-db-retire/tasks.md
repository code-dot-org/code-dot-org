# Tasks: pegasus-db-retire

Prerequisites: `pegasus-db-hoc`, `pegasus-db-poste`,
`pegasus-db-properties`, `pegasus-db-forms-drop` all merged, and
their production view-drop steps executed. Verify:
`grep -rn "PEGASUS_DB\[" --include=*.rb lib/ dashboard/ bin/ shared/`
returns nothing before starting.

## 1. Connection scaffolding

- [ ] 1.1 `lib/cdo/db.rb`: remove the `PEGASUS_DB` pool definition
      and `Sequel::Model.db = PEGASUS_DB` (verify no
      `< Sequel::Model` subclass exists:
      `grep -rn "Sequel::Model" --include=*.rb . --exclude-dir=.git`
      shows no subclassing); file keeps `DASHBOARD_DB`
- [ ] 1.2 `lib/cdo/app_server_hooks.rb`: remove the
      `PEGASUS_DB.disconnect` line (~:11) and its cop comments
- [ ] 1.3 `dashboard/lib/account_purger.rb` (~:57-69): remove the
      `PEGASUS_DB.transaction do ... end` nesting level and cop
      comments, preserving the AR + DASHBOARD_DB nesting
- [ ] 1.4 `lib/test/sequel_test_case.rb`: drop the PEGASUS_DB wrap
      (keep DASHBOARD_DB rollback wrap)
- [ ] 1.5 `shared/test/common_test_helper.rb` (~:96-115): remove the
      PEGASUS_DB validator lines and transaction level; keep
      DASHBOARD_DB's
- [ ] 1.6 `shared/test/test_cdo.rb` (~:19-20): remove pegasus_db key
      assertions

## 2. Config keys

- [ ] 2.1 `config.yml.erb`: remove `pegasus_db_name` (~:583) and
      `pegasus_db_reader`/`pegasus_db_writer` (~:591-592)
- [ ] 2.2 Verify no other config file defines them:
      `grep -rn "pegasus_db" config/ config.yml.erb aws/`

## 3. Build/CI plumbing

- [ ] 3.1 `lib/rake/build.rake` (~:196-217): delete the
      `build:pegasus` task and its inclusion gated on
      `CDO.build_pegasus`; remove `build_pegasus` from
      `config.yml.erb` (~:426) and
      `k8s/docker/locals.rake-build.yml` (~:13)
- [ ] 3.2 `lib/rake/install.rake` (~:65-80): delete `install:pegasus`
      and its registration
- [ ] 3.3 `shared/rake/test.rake` (~:6-13): remove the pegasus leg of
      `prepare_dbs` (chdir + `db:ensure_created db:migrate`); delete
      the task if empty
- [ ] 3.4 `lib/rake/test.rake`: unwrap per design.md decision 1 —
      remove only the `ENV['USE_PEGASUS_UNITTEST_DB']` set/delete
      lines from each wrapper block (~:231-269, find all with
      `grep -n USE_PEGASUS_UNITTEST_DB lib/rake/test.rake`), leaving
      inner task invocations byte-identical; delete `test:pegasus`
      (~:354-357), `test:pegasus_qa` (~:285-292),
      `test:changed:pegasus` (~:479-495), and their registrations
      (~:320, :575, :597 — verify each)
- [ ] 3.5 `.github/workflows/dev_run_single_test.yml` (~:39): remove
      the `test:changed:pegasus` step
- [ ] 3.6 `lib/cdo/test_run_utils.rb`: delete `run_pegasus_tests`
      (~:173-190) and its callers (grep `run_pegasus_tests`)

## 4. Tools, cop, oneoffs

- [ ] 4.1 Delete `bin/mysql-client-pegasus-reader`, `-writer`,
      `-reporting`; remove their mentions from
      `lib/cdo/mysql_console_helper.rb` (~:20,28)
- [ ] 4.2 Delete `tools/customLinters/rubocop_pegasus_db_usage.rb`;
      remove its registration (find how customLinters load:
      `grep -rn "customLinters\|CustomCops" .rubocop.yml .config/rubocop/ tools/`);
      remove every remaining
      `rubocop:disable/enable CustomCops/PegasusDbUsage` comment
      (`grep -rln "PegasusDbUsage" --exclude-dir=.git .`)
- [ ] 4.3 `lib/cdo/aws/dms.rb` (~:9):
      `%w(dashboard pegasus)` → `%w(dashboard)`
- [ ] 4.4 Delete dead oneoffs/trim ops scripts (verify each first):
      `bin/oneoff/wipe_data/poste_deliveries_and_contacts_emails`,
      `bin/oneoff/geocode-mailing-list-nyc`,
      `bin/oneoff/rename-projecturl-to-level`,
      `bin/oneoff/generate_legacy_survey_summaries.rb` (+
      `dashboard/lib/pd/foorm/legacy_survey_summaries.rb` if the
      oneoff is its only caller — verify with grep),
      `bin/oneoff/migrate_db`,
      `bin/oneoff/gh-ost_migrations/2022-12-15_*.sh`; trim pegasus
      lines from `bin/ops/puma-stats.sh`, `bin/restart_host`,
      `bin/cron/restart_high_memory_frontend_services` (these also
      serve dashboard — line edits, not deletions)
- [ ] 4.5 `lib/cdo/sequel.rb`: fix the `pegasus_read_replica`
      comment to state it gates read-splitting for all pools (flag
      NOT renamed — see design.md non-goals); delete the stale
      pegasus-server logging comment (~:96-99) if
      `pegasus-dead-code-sweep` did not already

## 5. Verify

- [ ] 5.1 Spec grep gates all pass
- [ ] 5.2 `bin/rails runner 'puts DASHBOARD_DB.tables.any?'` prints
      true from `dashboard/`
- [ ] 5.3 Full dashboard unit suite:
      `RAILS_ENV=test bundle exec rails test` from `dashboard/`
      (this change is the one that warrants the 15 minutes) — green
      without any pegasus schema present (drop local
      `pegasus_test`/`pegasus_unittest`/`pegasus_development` first
      to prove it)
- [ ] 5.4 `cd shared && bundle exec rake test` and lib tests pass
      with local pegasus schemas dropped
- [ ] 5.5 `bundle exec rake --tasks | grep -i pegasus` empty;
      local `bundle exec rake build` completes (dashboard-only)
- [ ] 5.6 `./tools/hooks/pre-commit` passes
- [ ] 5.7 PR carries the ops runbook. Every runbook step is a
      MANUAL TASK executed by a human, never by an implementing
      agent: quiet-period connection check → drop leftover views →
      `DROP DATABASE` pegasus schemas → chef globals sweep
      (`pegasus_db_*`, `poste_secret`, `poste_host`); Redshift
      `pegasus_production*` schemas noted as data-team-owned
