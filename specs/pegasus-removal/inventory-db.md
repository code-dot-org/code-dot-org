# Inventory: PEGASUS_DB per-table consumers (2026-07-07)

Companion to `plan.md`. Line numbers as of this date.

## lib/cdo/db.rb anatomy

13 lines. Requires `cdo/sequel` (pool factory), `sequel`, `cdo/cache`.
- `PEGASUS_DB = Cdo::Sequel.database_connection_pool CDO.pegasus_db_writer, CDO.pegasus_db_reader` (:7)
- `POSTE_DB = PEGASUS_DB` (:8) — pure alias
- `Sequel::Model.db = PEGASUS_DB` (:10) — no `< Sequel::Model` subclasses exist anywhere, but `lib/test/sequel_test_case.rb` reads `Sequel::Model.db`; hidden coupling
- `DASHBOARD_DB = ...` (:13) — dashboard-DB Sequel handle, heavily used (projects, contact_rollups, storage helpers); survives this plan

`lib/cdo/sequel.rb`: mysql2, utf8mb4, max 4 conns, read-splitting
gated by Gatekeeper `pegasus_read_replica`,
`sequel_4_dataset_methods` + `auto_literal_strings` extensions.

Boot path: `dashboard/config/application.rb:2` `require 'cdo/poste'`
→ `cdo/db`; also `levels_helper.rb:7` `require 'cdo/languages'` →
`cdo/db` (Languages itself is dead). Pool is lazy (`test: false`).
`lib/cdo/app_server_hooks.rb:11` — `PEGASUS_DB.disconnect` in puma
before_fork.

Config: `pegasus_db_reader/writer` (config.yml.erb:591-592) derive
from the SAME `db_reader`/`db_writer` endpoints as dashboard — the
pegasus DB is a sibling schema on the same Aurora cluster (verify
production chef globals before relying on this — decision D3).
`CDO.pegasus_reporting_db_reader` (used only by unscheduled
`bin/cron/hoc_signup_counts:16`) is defined nowhere in the repo —
comes from chef-managed globals on the daemon, if at all.

## Table-by-table

48 tables exist locally. Live ones below; all others
(`beyond_tutorials`, 30 `cdo_*`, `channel_table_metadata`,
`hoc_learn_activity`, `hoc_survey_prizes`, `poste_clicks`,
`geography_us_zip_codes`, `seed_info`, `schema_info` bookkeeping)
have zero code references.

### contacts (LIVE — email subsystem)
- `lib/cdo/poste.rb:93-111` `Poste.unsubscribe` R/W — **no remaining callers** (pegasus `/u/` endpoint deleted)
- `lib/cdo/poste.rb:230` `Deliverer#send` R (per email). LIVE via cron
- `lib/cdo/poste.rb:406-428,444-458` `Poste2.create_recipient`/`ensure_recipient` R/W. LIVE — `ensure_recipient` called by `Poste2::DeliveryMethod#deliver!` (:588), the ActionMailer delivery_method for dev/staging/prod
- `lib/cdo/delete_accounts_helper.rb:272,276` R + delete. LIVE (PiiScrubberJob nightly, AccountPurger)
- `bin/oneoff/export_pardot_contacts.rb:64,81` R. Oneoff
- DMS: `aws/dms/tasks.yml:33` → Redshift PII schema. LIVE pipeline

### poste_deliveries (LIVE — email queue, write-heavy)
- `lib/cdo/poste.rb:517` `Poste2.send_message` insert. LIVE (every dashboard email)
- `bin/cron/deliver_poste_messages_process.rb:100-127` R/W drain (`sent_at: nil`), student `contact_email` scrub. LIVE — every minute, all non-adhoc daemons
- `bin/cron/confirm_usage:74-75` R (backlog monitor). LIVE — every minute, production daemon
- `lib/cdo/delete_accounts_helper.rb:273,275` R + delete. LIVE
- `bin/oneoff/unsent_pl_emails_{enumerate,send}.rb` — oneoffs
- DMS: `tasks.yml:44`

### poste_messages (LIVE — template registry)
- `lib/cdo/poste.rb:68-71` insert-if-missing, `:226` R, `:511-512` R. Only template on disk: `lib/cdo/poste/emails/dashboard.html`

### poste_urls — dead
- `poste.rb:386,389` `Poste2.find_or_create_url` R/W — no callers remain (click-rewriter lived in deleted pegasus code)
- `bin/oneoff/deprecate_unused_poste_urls.rb`

### poste_opens — append-dead, delete-live
- `delete_accounts_helper.rb:274` delete. LIVE (PiiScrubber)
- Writer was the pegasus `/o/` pixel endpoint — deleted. Nothing writes
- NOTE: `Deliverer#send` still embeds `tracking_pixel: poste_url("/o/#{id}")` and `unsubscribe_link: poste_url("/u/...")` (poste.rb:234-242, host = CDO.poste_host = code.org). No route serves /o/ or /u/ — links 404 in production today. Decision D1

### poste_clicks — dead, zero references

### forms (write path gone; purge/monitor remnants)
- `poste.rb:124` `Poste::Template#render` R when delivery params include `form_id` (`Form2.from_row`, `lib/cdo/form.rb`) — no producer remains
- `delete_accounts_helper.rb:539,543,558` R + anonymizing update. LIVE via purge paths
- `bin/cron/confirm_usage:22` — freshness monitor asserts a forms row in last 60 min; nothing writes forms → check is broken/red. Remove with D1/D2
- `bin/cron/hoc_signup_counts:25-32` R via `PEGASUS_REPORTING_DB_READONLY`. Unscheduled/seasonal
- `dashboard/app/models/contact_rollups_processed.rb:236-303` consumes `'pegasus.forms'` keys, but `ContactRollupsV2#collect_contacts` (dashboard/lib/contact_rollups_v2.rb:94-121) has no pegasus extraction step — vestigial branches
- Oneoffs: `move_census_data.rb:445`, `update_pd_workshop_survey_ids.rb:11`
- DMS: `tasks.yml:34`

### form_geos
- `bin/cron/form_geos:19,25` R/W geocode backfill. LIVE — every minute (no-op with no new forms)
- `delete_accounts_helper.rb:548-557` anonymizing update. LIVE
- `hoc_signup_counts:27,32` R (unscheduled)
- `contact_rollups_processed.rb:319-352` vestigial
- DMS: `tasks.yml:35`

### hoc_activity (LIVE — hoc_legacy engine)
- `dashboard/engines/hoc_legacy/app/services/concerns/hoc_legacy/session_manageable.rb:43,60` insert/R/update. LIVE controller paths
- `certificates_controller.rb:28,45` update/R. Routes `GET/PATCH /api/hour/certificates/:session_id` (gated `CDO.hoc_tracking_enabled: true` in prod)
- tutorial services `tutorial_launcher.rb:20`, `tutorial_completer.rb:18-30`, `tutorial_pixel_{launcher,completer}.rb` — R/W. Routes `/api/hour/begin/:code`, `/finish/:code`, pixels
- `bin/cron/geocode_hoc_activity:23,35` R/W (+cursor in properties). LIVE — every minute
- `bin/cron/hoc_student_name_cleanup:32+` deletes `name` >3 months. LIVE — daily 02:00 prod daemon
- DMS: `tasks.yml:36-43` (PII columns removed)
- Tutorial metadata is Contentful now (`hoc_legacy/lib/hoc_legacy/tutorials.rb`); `cdo_tutorials` unused

### properties (LIVE — cron cursor/metrics KV)
- Wrapper `lib/cdo/pegasus/properties.rb` (global `DB = PEGASUS_DB` at :4; get/set/delete with 60s CDO.cache)
- Crons: `geocode_hoc_activity:15,48` (cursor), `hoc_student_name_cleanup:124,212` (cursor), `update_project_count:40-53` (`:metrics`), `hoc_signup_counts:46-47` (unscheduled)
- `fetch_metrics`/`fetch_hoc_metrics`/`fetch_user_metrics`/`fetch_project_count` (:56-90) — no callers; dead read API

### geography_us_zip_codes
- `src/database.rb:10` `zip_code_from_code`/`zip_code?` — no external callers. Dead

### cdo_languages + Languages
- `lib/cdo/languages.rb` abstract, no subclass, no callsites. Stale `require 'cdo/languages'` at `levels_helper.rb:7` drags cdo/db into boot. Dead

### seed_info + CsvToSqlTable
- `lib/cdo/data/csv_to_sql_table.rb` — no instantiations remain; `pegasus/data/` empty. Dashboard has its own separate AR `seed_info`. Dead

## Cron jobs (schedule: cookbooks/cdo-apps/templates/default/crontab.erb)

| script | pegasus tables | schedule |
|---|---|---|
| `deliver_poste_messages` → `deliver_poste_messages_process.rb` | poste_deliveries R/W, poste_messages R, contacts R (+DASHBOARD_DB users R) | `*/1` all non-adhoc daemons |
| `confirm_usage` | forms R (freshness — broken), poste_deliveries R (backlog) | `* * * * *` production daemon |
| `geocode_hoc_activity` | hoc_activity R/W, properties R/W | `*/1` non-adhoc daemons |
| `form_geos` | form_geos R/W | `*/1` non-adhoc daemons |
| `hoc_student_name_cleanup` | hoc_activity W, properties R/W | `0 2 * * *` production daemon |
| `update_project_count` | properties R/W (reads DASHBOARD projects count) | `0 4 * * 0` non-adhoc daemons |
| `hoc_signup_counts` | forms+form_geos R (PEGASUS_REPORTING_DB), properties W | not scheduled |
| `perform_job User::PiiScrubberJob` | contacts/poste_deliveries/poste_opens delete via DeleteAccountsHelper | `0 8 * * *` production daemon |
| `HocLegacy::RefreshTutorialsJob` | none (Contentful) | crontab.erb:133 |
| `user_geos`, `delete_twilio_data`, `update_dotd` | none (require src/env for helpers only) | various |

`purge_expired_deleted_accounts` / `purge_expired_child_accounts`
reach PEGASUS_DB via `AccountPurger#really_purge_data_for_account`
(`dashboard/lib/account_purger.rb:60` opens `PEGASUS_DB.transaction`
unconditionally) but are not in the crontab template.
`QueuedAccountPurge#resolve_as_purged!` also invokes AccountPurger —
console/admin-triggered.

## RuboCop

`tools/customLinters/rubocop_pegasus_db_usage.rb` —
`CustomCops/PegasusDbUsage` flags `PEGASUS_DB`/`POSTE_DB` outside
`/pegasus/`, `/bin/`, `/dashboard/engines/hoc_legacy/`. Inline
exemptions: `lib/cdo/db.rb`, `lib/cdo/poste.rb`,
`lib/cdo/pegasus/properties.rb`, `lib/cdo/delete_accounts_helper.rb`,
`lib/cdo/app_server_hooks.rb`, `dashboard/lib/account_purger.rb`,
tests (`lib/test/test_deliverer.rb`,
`dashboard/test/helpers/delete_accounts_helper_test.rb`,
`dashboard/test/testing/poste_assertions.rb`,
`shared/test/{common_test_helper,test_poste}.rb`). Sibling
`rubocop_dashboard_db_usage.rb` stays.

## Channels overlap

`storage_apps`/`user_storage_ids` are NOT in the pegasus DB. Channels
= `dashboard.projects` + `dashboard.user_project_storage_ids` via
DASHBOARD_DB Sequel (`shared/middleware/helpers/storage_id.rb:190-229`,
`dashboard/legacy/middleware/helpers/projects.rb`,
`dashboard/lib/projects_list.rb`,
`projects_controller.rb:239`, `delete_accounts_helper.rb:571`).
Sinatra-port plan owns those files; overlap with this plan is only
`lib/cdo/db.rb` (DASHBOARD_DB must survive).

## What breaks if PEGASUS_DB disappeared today

1. All transactional email from dashboard (Poste2::DeliveryMethod + drain cron)
2. Hour of Code tracking + certificates (hoc_legacy engine)
3. Account purge / PII scrub (DeleteAccountsHelper, AccountPurger, PiiScrubberJob)
4. Crons: deliver_poste_messages, confirm_usage, geocode_hoc_activity, form_geos, hoc_student_name_cleanup, update_project_count
5. DMS→Redshift pipeline (tasks.yml pegasus schema entries)
6. Rails boot (require chain), app_server_hooks disconnect
7. Build/deploy (`pegasus:setup_db` while `build_pegasus: true`), test seeding (`pegasus_test`, SequelTestCase, common_test_helper rollback wrappers, poste_assertions)
