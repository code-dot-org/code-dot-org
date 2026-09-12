# Design: pegasus-db-retire

## Context

Post-tier-2 state: the pegasus schema holds only dead tables
(30 `cdo_*`, `beyond_tutorials`, `channel_table_metadata`,
`hoc_survey_prizes`, `hoc_learn_activity`, `geography_us_zip_codes`,
`seed_info`, `schema_info`, `poste_clicks` remnants if not yet
dropped) and possibly leftover compatibility views. `PEGASUS_DB`
consumers remaining in code are scaffolding only:

- `lib/cdo/db.rb:7,10` (pool + dead `Sequel::Model.db`)
- `lib/cdo/app_server_hooks.rb:11` (pre-fork disconnect)
- `dashboard/lib/account_purger.rb:60` (empty transaction level)
- `lib/test/sequel_test_case.rb`, `shared/test/common_test_helper.rb`
  (test rollback wrapping), `shared/test/test_cdo.rb:19-20`
- `pegasus/rake/db.rake` (migrator; invoked by build/install/test
  rake wiring)
- `bin/mysql-client-pegasus-*`, assorted dead oneoffs

Build wiring: `lib/rake/build.rake:196-217` (`build:pegasus`, gated
on `CDO.build_pegasus` — default true, `config.yml.erb:426`; on
daemons runs `pegasus:setup_db` = ensure_created + migrate),
`lib/rake/install.rake:65-80`, `shared/rake/test.rake:6-13`
(`prepare_dbs` migrates the pegasus test DB before shared tests),
`lib/rake/test.rake:210-320` (USE_PEGASUS_UNITTEST_DB env plumbing
wrapping dashboard/lib/shared unit-test tasks), `:354-357`
(`test:pegasus` — runs `pegasus/test/`, which contains zero test
files), `:285-292` (`test:pegasus_qa`), `:479-495`
(`test:changed:pegasus`; its change-glob feeds
`.github/workflows/dev_run_single_test.yml:39`).

`Gatekeeper.allows('pegasus_read_replica')`
(`lib/cdo/sequel.rb:78-80`) gates `db_options[:servers]`
read-splitting for EVERY pool the factory builds — DASHBOARD_DB
included. The name is historical; the flag is live.

## Goals / Non-Goals

**Goals:**
- Zero `PEGASUS_DB` references; zero pegasus-DB creation anywhere in
  build/test/CI; schemas dropped in production by runbook.

**Non-Goals:**
- Deleting the `pegasus/` directory, migrations, or Rakefile
  (next change — after this one they are invoked by nothing).
- Renaming `pegasus_read_replica` (live Gatekeeper flag affecting
  dashboard reads; a rename needs a coordinated flag-store change —
  explicitly deferred, comment fixed to say what it really gates).
- Removing `Cdo::Sequel`/`sequel` gem (DASHBOARD_DB remains).

## Decisions

**1. test.rake surgery is unwrap, not delete.** The
USE_PEGASUS_UNITTEST_DB blocks WRAP other tasks (dashboard, lib,
shared unit tests) with env-var set/delete. Removing the wrapper
must leave the inner invocations byte-equivalent. Method: for each
of the ~6 blocks, delete only the `ENV['USE_PEGASUS_UNITTEST_DB']`
set/delete lines; then delete the now-meaningless comment at :215.
Diff review confirms no task body changed. `test:pegasus`,
`test:pegasus_qa`, `test:changed:pegasus` and their registrations
(:320, :575, :597 — verify) are deleted whole.

**2. `prepare_dbs` in shared/rake/test.rake** loses only its
pegasus leg (the chdir + `db:ensure_created db:migrate`); if the
task becomes empty, delete it and its callers.

**3. Cop deletion is repo-wide.** Delete
`tools/customLinters/rubocop_pegasus_db_usage.rb`, its registration
(grep `.rubocop.yml`/`.config/rubocop/` for how custom cops load),
and every `rubocop:disable/enable CustomCops/PegasusDbUsage` comment
(grep lists ~10 files; several were already deleted by earlier
changes).

**4. Runbook order.** (1) Verify zero connections to the pegasus
schema over a quiet period (cluster performance_schema or proxy
logs — ops); (2) drop leftover compat views; (3)
`DROP DATABASE pegasus_production` (+ staging/adhoc/test schemas as
they converge); (4) sweep chef-managed globals for
`pegasus_db_reader/writer/name`, `poste_secret`, `poste_host`.
Redshift `pegasus_production*` schemas are the data team's, dropped
on their schedule.

**5. Dead oneoffs die here** (the DB-scope stragglers):
`bin/oneoff/wipe_data/poste_deliveries_and_contacts_emails`,
`bin/oneoff/geocode-mailing-list-nyc`,
`bin/oneoff/rename-projecturl-to-level`,
`bin/oneoff/generate_legacy_survey_summaries.rb` (+ its
`dashboard/lib/pd/foorm/legacy_survey_summaries.rb` consumer if the
grep confirms it is only reachable from the oneoff),
`bin/oneoff/migrate_db`, `bin/oneoff/gh-ost_migrations/2022-12-15_*.sh`,
`bin/ops/puma-stats.sh` pegasus lines, `bin/restart_host` +
`bin/cron/restart_high_memory_frontend_services` pegasus mentions —
each verified-then-deleted (or line-trimmed for the ops scripts that
also serve dashboard).

## Risks / Trade-offs

- **Hidden boot dependency:** something may reference `PEGASUS_DB`
  only under an env flag. Gate: repo-wide grep must be empty, and
  full dashboard test suite + a local `rake build` run before merge.
- **Adhoc stacks** created from old branches will still try
  `pegasus:setup_db` — they run old code with old config, which
  still defines the keys; unaffected. New-branch adhocs skip it.
- **DTS migration detection** (`lib/cdo/github.rb` PEGASUS_DB_DIR)
  still points at `pegasus/migrations/` until directory-removal;
  harmless (no PRs touch it).
