# Pegasus Removal: Database Retirement

Change 10 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 3). With zero live tables left in the pegasus schema, removes
the `PEGASUS_DB` connection, its config keys, its test/build/CI
plumbing, and the custom cop that guarded it.

## Why

After `pegasus-db-hoc`, `pegasus-db-poste`, `pegasus-db-properties`,
and `pegasus-db-forms-drop`, no production code queries the pegasus
schema. What remains is connection scaffolding: every Rails process
still constructs the `PEGASUS_DB` pool at boot, every build still
runs `pegasus:setup_db` (`build_pegasus: true` default), the test
harness still creates and wraps `pegasus_test`/`pegasus_unittest`
schemas, and CI still runs an empty `test:pegasus` suite
(`pegasus/test/` contains only a helper — zero test files).

## What Changes

- `lib/cdo/db.rb`: remove `PEGASUS_DB` and the dead
  `Sequel::Model.db = PEGASUS_DB` assignment (no `Sequel::Model`
  subclasses exist); the file keeps `DASHBOARD_DB`.
- `lib/cdo/app_server_hooks.rb`: drop the `PEGASUS_DB.disconnect`
  pre-fork hook.
- `dashboard/lib/account_purger.rb`: drop the now-empty
  `PEGASUS_DB.transaction` nesting level.
- Test infra: `lib/test/sequel_test_case.rb` and
  `shared/test/common_test_helper.rb` drop their PEGASUS_DB
  transaction/validator wrapping (DASHBOARD_DB wrapping stays);
  `shared/test/test_cdo.rb` drops its pegasus_db key assertions.
- Config: remove `pegasus_db_name`, `pegasus_db_reader`,
  `pegasus_db_writer` from `config.yml.erb`.
- Build/CI plumbing: `build:pegasus` (`lib/rake/build.rake`) +
  `build_pegasus` key (+ `k8s/docker/locals.rake-build.yml`),
  `install:pegasus` (`lib/rake/install.rake`), the pegasus half of
  `shared/rake/test.rake` `prepare_dbs`, the entire
  `USE_PEGASUS_UNITTEST_DB` machinery and
  `test:pegasus`/`test:pegasus_qa`/`test:changed:pegasus` tasks in
  `lib/rake/test.rake`, `run_pegasus_tests` in
  `lib/cdo/test_run_utils.rb`, and the
  `test:changed:pegasus` step in
  `.github/workflows/dev_run_single_test.yml`.
- Tools: delete `bin/mysql-client-pegasus-{reader,writer,reporting}`
  and their mentions in `lib/cdo/mysql_console_helper.rb`; delete
  the `CustomCops/PegasusDbUsage` cop and all its inline
  disable/enable comments repo-wide.
- `lib/cdo/aws/dms.rb`: schema list `%w(dashboard pegasus)` →
  `%w(dashboard)`.
- Delete the last PEGASUS_DB-touching oneoffs/ops scripts
  (enumerated in tasks).
- NOT removed: the Gatekeeper flag `pegasus_read_replica`
  (`lib/cdo/sequel.rb`) — despite the name it gates read-splitting
  for ALL pools including DASHBOARD_DB; renaming a live Gatekeeper
  flag is out of scope. Comment corrected instead.
- Ops runbook: drop leftover compatibility views, then
  `DROP DATABASE` the pegasus schemas after a quiet period; sweep
  stale chef globals (`pegasus_db_*`, `poste_secret`, `poste_host`).

Depends on: all four tier-2 changes merged and their view-drops
executed.

## Capabilities

### New Capabilities

- `pegasus-db-retired`: no process connects to, creates, or tests
  against a pegasus schema.

### Modified Capabilities

_None._

## Impact

- Rails boot no longer constructs the pool; builds and deploys skip
  a bundle+migrate leg; CI drops an empty test suite.
- `pegasus/` directory becomes fully inert (nothing invokes its
  Rakefile) — deleted next by `pegasus-directory-removal`.
- Risk concentrated in the test.rake surgery (the
  USE_PEGASUS_UNITTEST_DB wrapper encloses dashboard/lib/shared test
  tasks — unwrap without changing what those tasks run).
