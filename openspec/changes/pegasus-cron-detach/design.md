# Design: pegasus-cron-detach

## Context

`lib/cdo/pegasus/src/env.rb` requires (in order): `deployment`,
`cdo/pegasus` (umbrella), `i18n` + fallbacks + `cdo/i18n_backend`,
`logger`, `bcrypt`, `chronic`, `nokogiri`; defines dead dir helpers
(`cache_dir`, `sites_dir`, `sites_v3_dir`, `hoc_dir`, `src_dir` — zero
external callers) and `Pegasus.logger`/`$log` (no cron uses either;
verified). `src/database.rb` (27 lines) defines zip helpers (zero
callers) and geocode helpers (`search_for_address`,
`geocode_address` — remaining callers are
`bin/cron/applab_datasets/daily_weather`, which defines its own
copies and does not require this file, and three dead oneoffs).

Per-script audit of what each cron actually uses (2026-07-07):

| script | uses from pegasus tree | replacement requires |
|---|---|---|
| `update_dotd` | nothing (already requires deployment at :8) | drop src/env :7 |
| `delete_twilio_data` | nothing | drop src/env :9; add deployment |
| `hoc_student_name_cleanup` | `Properties` | drop src/env :22; add deployment; `cdo/pegasus/properties`:26 → `cdo/properties` |
| `deliver_poste_messages_process.rb` | transitively `deployment` for `cdo/poste`; `nil_or_empty?` via umbrella (fixed by core-ext-extraction) | drop src/env :1; add deployment |
| `geocode_hoc_activity` | `Properties`, bare `DB` global, `Geocoder` (via src/database's require) | drop :8-9; add deployment + `cdo/db` + `cdo/geocoder` + `cdo/properties`; `DB` → `PEGASUS_DB` (2 sites: `DB.fetch`, `DB[:hoc_activity]`) |
| `form_geos` | nothing (has own cdo/db + cdo/geocoder) | drop src/env :8; add deployment |
| `user_geos` | nothing | drop src/env :8; add deployment |
| `update_project_count` | `Properties` | drop src/env :12 and src/database :15; `cdo/pegasus/properties`:13 → `cdo/properties` (deployment already :16) |
| `hoc_signup_counts` | `Properties` | drop src/env :8; add deployment; :11 → `cdo/properties` |
| `bin/upload_new_census_data_to_mapbox` | `Properties` (loads dashboard environment) | :20 → `cdo/properties` |

`pegasus/Rakefile:1` requires src/env (for `deployment` + `$log`
setup — the Rakefile sets its own `$log` at :41-44) and `:46`
requires `cdo/pegasus/src/database` (for the `DB` global via
properties). `pegasus/rake/db.rake` uses bare `DB` at :31,32,56,64,
70,71.

## Goals / Non-Goals

**Goals:**
- Zero requires into `lib/cdo/pegasus/` from bin/, pegasus/, or
  anywhere except `graphics.rb`'s consumers.
- `Properties` available at `lib/cdo/properties.rb`, no `DB` global.

**Non-Goals:**
- Changing what any cron does — same tables, same queries, same
  schedules.
- Migrating the `properties` table off PEGASUS_DB (that is
  `pegasus-db-properties`).
- Touching `graphics.rb` (owned by `pegasus-shared-resources-port`).

## Decisions

**1. `Properties` moves as-is minus the global and dead readers.**
New file `lib/cdo/properties.rb`, class body verbatim except
`@@table = DB[:properties]` becomes
`@@table = PEGASUS_DB[:properties]` (with the existing
`rubocop:disable CustomCops/PegasusDbUsage` pattern), and
`fetch_metrics`/`fetch_hoc_metrics`/`fetch_user_metrics`/
`fetch_project_count` are dropped after a caller grep confirms zero
uses. Rationale for keeping the generic class name `Properties`: all
five consumers use it; renaming is churn with no removal value.

**2. Bare `DB` dies now.** The global was properties.rb's hidden
export. Its two consumers (`geocode_hoc_activity`, `db.rake`) switch
to `PEGASUS_DB` explicitly. A repo-wide grep for `^DB =` and `DB[:`
is a task gate to catch stragglers.

**3. Every detached script gets `require_relative '../../deployment'`**
(path-adjusted) as its first non-`only_one` require, replacing
src/env's transitive provision of CDO. Scripts that already require
deployment just lose the src/env line.

**4. Umbrella and friends die here.** After
`pegasus-core-ext-extraction`, `lib/cdo/pegasus.rb` requires only
`array`, `file_utility`, `hash` — all dead (guarded no-ops or zero
callers). src/env.rb was the umbrella's last requirer. Tests
`test_array.rb`, `test_hash.rb`, `test_file_utility.rb` delete with
them; `test_properties.rb` moves alongside its class.

## Risks / Trade-offs

- **Risk:** a cron implicitly relied on a src/env side effect
  (gem require, i18n init). Mitigation: per-script `ruby -c` plus a
  load-only smoke run in tasks; the audited scripts use none of the
  side effects, and `bcrypt`/`chronic`/`nokogiri` are required by
  their real consumers where needed (poste requires nokogiri itself).
- **Risk:** production daemon converges mid-deploy while a cron
  fires. The scripts are edited atomically per deploy; a mixed state
  is the same class of risk as any cron edit — accepted.
