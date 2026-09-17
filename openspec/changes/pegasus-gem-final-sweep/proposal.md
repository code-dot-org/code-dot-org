# Pegasus Removal: Sinatra Gem and Final Sweep

Change 13 — the last of the pegasus removal series
(`specs/pegasus-removal/plan.md`, tier 5). Removes the `sinatra`
gem, the last helper written for it, and every remaining prose
reference to pegasus. Ends with the series' final grep gate.

## Why

Two prerequisites make the `sinatra` gem removable: the external
sinatra-port series (PR #73697, 7 changes) deletes the five
`dashboard/legacy/middleware/` apps, and
`pegasus-shared-resources-port` deletes the sixth
(`SharedResources`). After both, the gem's only consumers are
`lib/cdo/sinatra.rb` (a `get_or_post` helper for the deleted apps)
and stale docs. Documentation still teaches pegasus everywhere —
TESTING.md has pegasus test sections, AGENTS.md says "IGNORE the
pegasus/ directory", SETUP/CONTRIBUTING/README describe running it.

## What Changes

- **GATE:** verify the sinatra-port series' final change
  (`sinatra-port-netsim-codeprojects`) and
  `pegasus-shared-resources-port` are merged; repo-wide grep for
  `sinatra` requires must show only the Gemfile and
  `lib/cdo/sinatra.rb`.
- Remove `gem 'sinatra'` from the Gemfile; `bundle install`.
- Delete `lib/cdo/sinatra.rb` and `lib/test/cdo/pegasus/` remnants
  if any prior change left the directory.
- Gemfile comment fixes not already done by
  `pegasus-dead-code-sweep`; `lib/dynamic_config/dcdo.rb:56` stale
  "remove as part of pegasus cleanup" note (act on it: check whether
  the `aif-launch` DCDO flag it describes is deletable; if unclear,
  rewrite the comment without the pegasus framing).
- Documentation sweep: `TESTING.md` (pegasus test sections, the
  seeding steps referencing `pegasus/`), `README.md:41,56`,
  `CONTRIBUTING.md:27-28`, `SETUP.md:234`, `AGENTS.md` ("IGNORE the
  pegasus/ directory" line), `shared/css/README.md:25,29`,
  `docs/importing-data.md`, `docs/pdf-lesson-plan-generation.md:44-68`,
  `docs/where-are-the-logs.md:7-11`, `docs/log-formats.md:231,372`,
  `config/i18n/locales.yml:12` comment,
  `dashboard/app/models/census/README.md:11` permalink — update or
  delete each pegasus passage to describe current reality.
- Final gate: `grep -ri pegasus` across the repo returns only the
  documented fossils (DCDO `pegasus_*_max_age` keys, Gatekeeper
  `pegasus_read_replica`, AWS-side name strings if
  `pegasus-marketing-rename` kept them, git history references in
  archived openspec changes).

## Capabilities

### New Capabilities

- `pegasus-fully-removed`: the terminal invariant — no sinatra gem,
  no pegasus code, and documentation describes the current system.

### Modified Capabilities

_None._

## Impact

- Gemfile/lockfile shrink (sinatra + its rack constraints).
- 10+ docs corrected.
- This change closes the series; its final grep gate is the
  acceptance test for the whole removal.
