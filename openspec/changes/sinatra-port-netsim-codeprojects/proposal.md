# Sinatra Port: NetSim, codeprojects.org, and Middleware Teardown

Phase 7 — final phase — of the Sinatra middleware port series (after
`sinatra-port-curated-libraries`). Ports `NetSimApi`
(`dashboard/legacy/middleware/net_sim_api.rb`) and the codeprojects.org
routes remaining in `FilesApi`, then deletes all remaining Sinatra middleware
from the stack and the repo.

## Why

Everything else has been ported; these are the two surfaces with no
`frontend/` future (NetSim is the apps/-only Internet Simulator; the
codeprojects routes serve published WebLab1 sites on another domain). Porting
them completes the goal: no Sinatra apps in the dashboard Rack stack, all
HTTP served by the Rails router.

## Decisions

- Strict parity; `test_net_sim_api.rb` (~65 tests, fake Redis +
  `SpyPubSubApi`) translates 1:1.
- Full treatment per series decision: NetSim gets canonical
  `/api/v1/netsim...` routes (CSRF on; no current caller) plus `/v3/netsim`
  aliases (CSRF off) serving the real apps/ traffic. The codeprojects routes
  cannot be `/api/v1`-namespaced — they are root-level paths on the
  codeprojects.org host — so they port as host-constrained Rails routes at
  their existing paths (a routes `constraints` lambda replacing Sinatra's
  `code_projects_domain` condition), CSRF-exempt (GET-only surface).
- `RedisTable`, `ShardedRedisFactory`, `PusherApi`/`NullPubSubApi` move
  unchanged from `dashboard/legacy/middleware/helpers/` to `dashboard/lib/`
  — they are storage, not web. The `@@overridden_pub_sub_api` /
  `@@overridden_redis` class-variable test seams are replaced with injectable
  class attributes on the controller.
- NetSim CloudWatch metrics (`record_metric` behind `CDO.netsim_enable_metrics`)
  and request-size cap (50 KB → 413) port verbatim.
- Teardown scope: remove the `FilesApi`, `ChannelsApi`, `NetSimApi` requires
  and inserts from `config/application.rb` (`SharedResources` is a separate
  engine and STAYS); delete `files_api.rb`, `channels_api.rb`,
  `net_sim_api.rb`, the emptied legacy middleware test scaffolding, and
  `lib/cdo/rack/request.rb`'s `user_id_from_session_store` remains (other
  consumers) — auditing that is a task, not a promise. Surviving helpers
  (`projects.rb`, `bucket_helper.rb`, buckets, `auth_helpers.rb` for
  ReportAbuseController) stay in place; relocating them is future work
  outside this series.

## What Changes

- New `Api::V1::NetsimController` (+ legacy subclass): table reads (all rows,
  `@<min_id>` suffix reads, single row, multi-table query-string fetch),
  inserts (single + array multi-insert, per-table validation
  malformed/conflict/limit_reached, 201, JSON content-type gate → 415, 50 KB
  cap → 413), updates (POST/PATCH/PUT, 404 on missing row), deletes (single,
  multi-id, cascade wires+messages on node delete, 204), shard delete
  (admin or owning teacher by `_<section-id>` suffix → else 401), and the
  `POST .../delete` old-browser aliases.
- New `CodeprojectsController` (name final at implementation):
  host-constrained `GET` routes — file serve under `/projects/weblab/:ch/:file`,
  directory redirects, root-channel redirect, index serve with the footer
  script/CSS injection into HTML and `Content-Security-Policy: connect-src
  'self'` header, gated by `codeprojects_can_view?` (active project + owner
  sharing enabled).
- Middleware teardown as decided above; legacy middleware test directory
  reduced to helper tests that still cover surviving storage classes.

## Capabilities

### New Capabilities

- `sinatra-port-netsim-api`: the NetSim HTTP surface on both route surfaces.
- `sinatra-port-codeprojects-hosting`: published-WebLab serving on
  codeprojects.org.
- `sinatra-port-middleware-teardown`: the end state — no project Sinatra
  middleware in the Rack stack.

### Modified Capabilities

None.

## Impact

- `config/application.rb` loses the remaining middleware wiring; three
  Sinatra app files and `test_net_sim_api.rb` deleted; `RedisTable` family
  relocates to `dashboard/lib/`.
- Clients unchanged: `apps/src/netsim/NetSimApi.js`, published
  codeprojects.org URLs.
- NetSim polling is the hottest read path in the series — compare poll
  latency before/after cutover, same gate as the sources phase.
- `dashboard/test/ui/features/star_labs/netsim_lobby.feature` covers NetSim
  end to end on drone.
