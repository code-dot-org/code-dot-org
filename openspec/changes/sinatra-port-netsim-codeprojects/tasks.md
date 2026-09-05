# Tasks

TDD throughout. Semantics of record: `net_sim_api.rb` +
`test_net_sim_api.rb`; `files_api.rb` codeprojects routes. Depends on all
prior series changes. Three sub-surfaces, committed in order.

## 1. NetSim

- [ ] 1.1 Move `redis_table.rb`, `sharded_redis_factory.rb`,
      `pusher_api.rb`, `null_pub_sub_api.rb`, `table.rb` from
      `dashboard/legacy/middleware/helpers/` to `dashboard/lib/`, updating
      requires and the helper unit tests
      (`test_redis_table.rb` etc.) — no behavior change; suites green.
      Replace `RedisTable::NotFound < Sinatra::NotFound` with a plain
      StandardError subclass and adjust rescues.
- [ ] 1.2 Create
      `dashboard/test/integration/api/v1/netsim_api_legacy_parity_test.rb`
      translating `test_net_sim_api.rb` 1:1 against `/v3/netsim` alias paths
      using fake Redis + `SpyPubSubApi` via the new injectable seams; add
      canonical CSRF pair tests and the shard-reset authorization scenarios.
      Red.
- [ ] 1.3 Implement `Api::V1::NetsimController` (+ legacy subclass): reads,
      validated inserts, updates, cascading deletes, shard reset, verb
      aliases, 50 KB cap, metrics behind `CDO.netsim_enable_metrics`;
      injectable `pub_sub_api`/`redis` class attributes for tests. Routes on
      both surfaces (note `@<min_id>` and `?t[]=`/`?id[]=` parsing —
      query-string handling ports verbatim). Green behind middleware.
- [ ] 1.4 Remove `NetSimApi` from `config/application.rb`; delete
      `net_sim_api.rb` and `test_net_sim_api.rb`; keep `channels_api.rb`
      shell deletion for task 3.1. Parity tests green against Rails. Compare
      poll latency before/after; note in PR. Run
      `dashboard/test/ui/features/star_labs/netsim_lobby.feature` locally.
      Commit.

## 2. codeprojects.org

- [ ] 2.1 Write
      `dashboard/test/integration/codeprojects_hosting_test.rb` covering the
      host constraint (matching vs studio host), weblab-only 404, redirect
      chain (`/<ch>/` → `/projects/weblab/<ch>/`; no-slash → slash), index
      serving with footer injection + CSP header, `codeprojects_can_view?`
      gating (inactive project, sharing-disabled owner → 404), and
      fall-through for non-channel path segments. Drive with
      `host!`-style integration requests. Red.
- [ ] 2.2 Implement the codeprojects controller + host-constrained routes
      porting the four `code_projects_domain` route blocks and `get_file`'s
      codeprojects mode from `files_api.rb`. Green behind middleware.
- [ ] 2.3 Delete the codeprojects route blocks from `files_api.rb`. Green
      against Rails. Commit.

## 3. Teardown

- [ ] 3.1 Remove the `FilesApi` and `ChannelsApi` requires and inserts from
      `config/application.rb`; delete `files_api.rb`, `channels_api.rb`, and
      the legacy Rack::Test scaffolding (`files_api_test_base.rb`,
      `files_api_test_helper.rb`, `middleware_test_helper.rb`,
      `spy_pub_sub_api.rb` if now unused). Add explicit requires for
      surviving helpers (`projects.rb`, buckets, `auth_helpers.rb`) at their
      remaining consumers (ported controllers, `ReportAbuseController`) —
      audit with a full app boot + test run.
- [ ] 3.2 Write the stack-audit test asserting none of the five Sinatra class
      names appear in `Rails.configuration.middleware` and `SharedResources`
      still does.
- [ ] 3.3 Audit remaining consumers of
      `lib/cdo/rack/request.rb#user_id_from_session_store`; if pegasus/other
      middleware still uses it, leave it with a comment; if dashboard-only,
      file the removal follow-up.
- [ ] 3.4 Full dashboard test suite (this change is broad enough to warrant
      it, per TESTING.md), remaining legacy helper tests,
      `./tools/hooks/pre-commit`, then a full drone run before merge.
