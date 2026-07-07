# Pegasus Removal: Dead Code Sweep

Change 1 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 1). Pure deletion of code with zero callers. No behavior change.

## Why

The pegasus Sinatra server and forms subsystem are deleted, but the
repo still carries their orphans: server-start scripts for an app that
no longer exists, ~30 dead oneoff/ops scripts, three gems with zero
callers, config keys nothing reads, and infra references to a
decommissioned service. Every orphan is a false lead for future work
and a drag on the remaining removal changes, which get simpler once
the noise is gone.

## What Changes

- Delete dead executables: `bin/pegasus-server`, `bin/pegasus-console`,
  `bin/force-gsheet`, three `*-hoc2016` ops relics,
  `bin/solr/update_document`, and the dead oneoff scripts enumerated
  in tasks.md (each verified caller-free).
- Delete dead library code: `lib/cdo/languages.rb` (abstract class, no
  subclass, no callsite) and its stale require in `levels_helper.rb`;
  `lib/cdo/pegasus/actionview_sinatra.rb` and
  `lib/cdo/pegasus/screencap.rb`/`screencap.js` (+ tests).
- Delete the unreferenced view
  `dashboard/app/views/api/terms_interstitial_for_pegasus.html.haml`.
- Remove gems with zero callers: `rack_csrf`, `pdf-reader`, `thin`
  (only caller was `bin/pegasus-server`).
- Remove config keys with zero consumers: `pegasus_honeybadger_api_key`,
  `pegasus_workers`, `pegasus_sock`, `pegasus_web_server_name`.
- Remove decommissioned-infra references: pegasus Honeybadger project,
  `production-pegasus` ELB deregistration entry, dead `pegasus_dir`
  helper in `crontab.erb`, `.pegasus-built` gitignore markers, unused
  "Pegasus Puma" port-9001 security-group rules in `vpc.yml.erb`.
- Fix stale comments that mislead readers about pegasus dependencies.

Explicitly NOT touched here: `lib/cdo/poste.rb` (owned by
`pegasus-poste-dead-links`), `lib/cdo/pegasus/{string,graphics,object,
properties,src/*}` (owned by `pegasus-string-extraction`,
`pegasus-shared-resources-port`, `pegasus-cron-detach`), anything
under `pegasus/` itself, any `PEGASUS_DB` consumer,
`lib/cdo/url_converter.rb` (live Cucumber tooling; renamed in
`pegasus-marketing-rename`).

## Capabilities

### New Capabilities

- `pegasus-dead-code-removal`: the invariant that deleted pegasus
  orphans (executables, gems, config keys, infra references) stay
  gone — expressed as grep-gates over the repo.

### Modified Capabilities

_None — no existing spec's behavior changes; everything deleted has
zero callers._

## Impact

- `bin/`, `bin/oneoff/`, `bin/solr/`: ~30 files deleted.
- `lib/cdo/`: 3 files deleted (+ their tests under `lib/test/cdo/`).
- `dashboard/`: one dead view deleted, one stale require removed.
- `Gemfile` + `Gemfile.lock`: 3 gems removed (lock regenerated).
- `config.yml.erb`, `config/test.yml.erb`, `config/development.yml.erb`:
  4 dead keys removed.
- `lib/cdo/honeybadger.rb`, `lib/cdo/server_tools.rb`,
  `cookbooks/cdo-apps/templates/default/crontab.erb`, `aws/.gitignore`,
  `aws/cloudformation/vpc.yml.erb`: dead entries removed. The SG-rule
  removal takes effect on the next VPC stack update; no separate
  deploy step.
- ELB verification already done (2026-07-07, read-only AWS check):
  no classic ELBs exist at all; `server_tools.rb`'s dead
  deregistration method deletes whole if caller-free.
