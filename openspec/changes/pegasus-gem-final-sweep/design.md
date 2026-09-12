# Design: pegasus-gem-final-sweep

## Context

Gem audit (2026-07-07, `specs/pegasus-removal/inventory-gems-infra.md`
§A): `sinatra` consumers are the five legacy middleware apps
(deleted by the external sinatra-port series),
`shared/middleware/shared_resources.rb` (deleted by
`pegasus-shared-resources-port`), `lib/cdo/sinatra.rb` (helper for
the five apps), and `lib/cdo/pegasus/actionview_sinatra.rb`
(deleted by `pegasus-dead-code-sweep`). `sinatra-contrib`,
`rack-contrib` are not in the bundle. The `sass` gem stays
transitive (bootstrap-sass, scss_lint); `sequel`/`mysql2`/`pusher`/
`jumphash`/`rerun`/`parallel_tests`/`open_uri_redirections`/
`phantomjs`/`redcarpet` all have live non-pegasus consumers — none
are touched.

Documentation debt is enumerated in the proposal; each doc edit
should describe what IS, not narrate the removal.

## Goals / Non-Goals

**Goals:** no sinatra in the bundle; no pegasus in prose; a single
final grep gate defining "done" for the whole series.

**Non-Goals:** removing `sequel`, `mysql2`, `sass` (transitive), or
any gem with live consumers; rewriting docs beyond the pegasus
passages; touching the accepted fossils (DCDO max-age keys,
Gatekeeper flag, AWS-side names).

## Decisions

**1. Hard gate before gem removal.** The change starts with a
mechanical check, not an assumption:
`grep -rn "sinatra" Gemfile Gemfile.lock lib/ dashboard/ shared/ bin/ --include=*.rb`
must show only the Gemfile line and `lib/cdo/sinatra.rb`. If the
sinatra-port series is incomplete, this change waits — no partial
removal.

**2. Docs are corrected, not annotated.** Delete pegasus test
sections from TESTING.md (including the `pegasus_test` seeding step
in the dashboard-test setup — dashboard tests no longer need it
after `pegasus-db-retire`); rewrite the AGENTS.md monorepo
description without the pegasus warning; README/CONTRIBUTING/SETUP
lose their pegasus setup/run instructions. Where a doc explained a
still-real concept via pegasus (e.g. log formats), rewrite the
example against dashboard.

**3. The final gate is scoped by an explicit fossil allowlist**
(written into the task): DCDO `pegasus_*_max_age` (+ their DCDO.get
callsites in the shared-assets controller), Gatekeeper
`pegasus_read_replica` (+ comment), AWS-side strings in
cloudfront.rb if retained, `openspec/changes/` archive documents,
and `specs/pegasus-removal/` itself. Anything else matching
`pegasus` is a defect in one of the prior changes — fix it here and
note which change missed it.

## Risks / Trade-offs

- **Transitive lockfile churn** when sinatra leaves (rack version
  constraints may float). Review the lock diff; rails pins rack
  adequately.
- **Doc edits drift fast** — keep them minimal and factual so the
  next reorganization does not orphan them.
