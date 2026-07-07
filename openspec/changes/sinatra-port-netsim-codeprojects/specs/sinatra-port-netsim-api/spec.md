# sinatra-port-netsim-api

NetSim (Internet Simulator) HTTP surface from
`dashboard/legacy/middleware/net_sim_api.rb`, backed by `RedisTable` over
sharded Redis with Pusher pub/sub. Semantics of record: that file plus
`test_net_sim_api.rb` (~65 tests, translated 1:1 by tasks).

## ADDED Requirements

### Requirement: Dual route surfaces for netsim
Every netsim endpoint SHALL be served canonically under `/api/v1/netsim...`
(CSRF enforced) and at its legacy `/v3/netsim...` alias (CSRF skipped),
including the `POST .../delete` old-browser aliases, with `net_sim_api.rb`
deleted in this change. The Redis/pub-sub test seams SHALL become injectable
class attributes replacing the legacy `@@overridden_*` class variables.

#### Scenario: Poll without token
- **WHEN** the NetSim client GETs `/v3/netsim/<shard>/n` with no CSRF token
- **THEN** the rows are returned exactly as under the middleware

### Requirement: Table reads
Reads SHALL port byte-for-byte: full-table read, `<table>@<min_id>`
incremental read, single row by id (404 via `RedisTable::NotFound`), and the
multi-table fetch (`GET /v3/netsim/<shard>?t[]=<table>@<id>...`) — all JSON
with `dont_cache` headers.

#### Scenario: Incremental poll
- **WHEN** rows 1-5 exist and the client GETs `.../n@3`
- **THEN** only rows with id >= 3 are returned

### Requirement: Inserts with validation
`POST` to a table SHALL require JSON/UTF-8 content type (else 415), reject
bodies over 50 KB with 413 (recording the size metric), answer 400 with the
legacy JSON error details for malformed rows, node-type violations, router
number conflicts or the router limit (`limit_reached` at
`CDO.netsim_max_routers`), messages whose `simulatedBy` node is absent, and
duplicate directed wires; valid single inserts answer 201 with the row (id
assigned), and array bodies multi-insert answering 201 with the row array
(per-row error details on failure).

#### Scenario: Router limit
- **WHEN** a router insert would exceed the configured router maximum
- **THEN** the response is 400 with details `limit_reached` and nothing is
  inserted

#### Scenario: Multi-insert
- **WHEN** an array of two valid rows is POSTed
- **THEN** the response is 201 with both rows carrying assigned ids

### Requirement: Updates and deletes with cascade
Row update (POST/PATCH/PUT identical) SHALL enforce the content-type gate and
size cap, 404 on missing rows, and return the updated row. Deletes SHALL port
single-row delete, multi-id delete
(`DELETE .../<table>?id[]=...`, non-integer ids ignored), and the node-delete
cascade (wires touching the node and messages simulated by it are deleted in
the same operation), all answering 204.

#### Scenario: Node cascade
- **WHEN** a node with attached wires and messages is deleted
- **THEN** those wires and messages are gone and pub/sub change notifications
  fire for each affected table

### Requirement: Shard reset authorization
`DELETE` of an entire shard SHALL answer 401 unless the current user is an
admin or owns the section whose id trails the shard id (`_<section-id>`
suffix), and on success reset the shard via `RedisTable.reset_shard`,
answering 204.

#### Scenario: Teacher resets own section shard
- **WHEN** the owning teacher of section 42 DELETEs shard `ws_42`
- **THEN** the shard is reset and the response is 204

#### Scenario: Stranger cannot reset
- **WHEN** a signed-in non-owner, non-admin DELETEs the same shard
- **THEN** the response is 401
