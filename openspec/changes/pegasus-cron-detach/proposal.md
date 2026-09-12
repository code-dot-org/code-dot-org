# Pegasus Removal: Cron Detach

Change 3 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 1). Detaches the production cron scripts from
`lib/cdo/pegasus/src/env.rb` and deletes the pegasus library tree's
remaining live files by relocating them.

## Why

Eight production-scheduled cron scripts (and two manual scripts)
still require `lib/cdo/pegasus/src/env.rb` — a boot file for the
deleted pegasus web server that drags in i18n backends, bcrypt,
chronic, nokogiri, dead directory helpers, and a logger pointed at
`pegasus/log/`. What the crons actually need from it is one require:
`deployment` (the CDO config). Two files behind it are genuinely
live: `properties.rb` (the `Properties` KV wrapper the crons use for
cursors/metrics — which also sneakily defines a global
`DB = PEGASUS_DB`) and nothing else. Until these requires are gone,
`lib/cdo/pegasus/` cannot be deleted and the `pegasus/` Rakefile
keeps a require chain into it.

## What Changes

- The scripts drop `require .../cdo/pegasus/src/env` and gain a
  direct `require_relative '../../deployment'` where missing:
  `bin/cron/update_dotd`, `delete_twilio_data`,
  `hoc_student_name_cleanup`, `deliver_poste_messages_process.rb`,
  `geocode_hoc_activity`, `form_geos`, `user_geos`,
  `update_project_count`, `hoc_signup_counts`.
- `lib/cdo/pegasus/properties.rb` moves to `lib/cdo/properties.rb`:
  the `DB = PEGASUS_DB` global is removed (the class uses
  `PEGASUS_DB[:properties]` directly), and the caller-free
  `fetch_metrics`/`fetch_hoc_metrics`/`fetch_user_metrics`/
  `fetch_project_count` helpers are dropped. Consumers repoint
  (`geocode_hoc_activity`, `hoc_student_name_cleanup`,
  `update_project_count`, `hoc_signup_counts`,
  `bin/upload_new_census_data_to_mapbox`).
- `bin/cron/geocode_hoc_activity` replaces its bare-`DB` dataset
  calls (which depended on the removed global) with `PEGASUS_DB`.
- `pegasus/Rakefile` requires `deployment` + `cdo/db` instead of
  `src/env` + `src/database`; `pegasus/rake/db.rake` uses
  `PEGASUS_DB` instead of the bare `DB` global.
- Delete `lib/cdo/pegasus/src/env.rb`, `src/database.rb` (zip helpers
  have zero callers; geocode helpers' only requirers were oneoffs
  deleted in `pegasus-dead-code-sweep`), the `lib/cdo/pegasus.rb`
  umbrella, `array.rb`, `hash.rb`, `file_utility.rb`, and their tests
  (all methods dead or ActiveSupport-guarded no-ops; audit in
  `pegasus-core-ext-extraction` design.md).
- After this change, `lib/cdo/pegasus/` contains only `graphics.rb`
  (deleted by `pegasus-shared-resources-port`).

Depends on: `pegasus-dead-code-sweep` (deletes the ~25 oneoffs that
require src/env), `pegasus-core-ext-extraction` (gives `poste.rb` its
explicit `cdo/object` require — the deliver cron loses the umbrella
that provided `nil_or_empty?`).

## Capabilities

### New Capabilities

- `pegasus-cron-independence`: production cron scripts run without
  any `lib/cdo/pegasus/` require; `Properties` served from
  `lib/cdo/properties.rb`.

### Modified Capabilities

_None._

## Impact

- 10 bin scripts edited (require blocks only, except
  `geocode_hoc_activity`'s `DB`→`PEGASUS_DB`).
- `lib/cdo/properties.rb` new; 6 files under `lib/cdo/pegasus/`
  deleted (+ 3 test files); `pegasus/Rakefile` + `rake/db.rake`
  edited.
- Behavior: identical queries against identical tables. The one
  intentional difference: crons no longer initialize the i18n
  backend or `Pegasus.logger` — none used either.
- Cron schedules (`crontab.erb`) unchanged; script names unchanged.
