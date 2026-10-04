# Inventory: gems + infra/config pegasus references (2026-07-07)

Companion to `plan.md`. Line numbers as of this date.
`dashboard/Gemfile{,.lock}` are symlinks to the root files — one gem
universe. No `group :pegasus` anywhere; `BUNDLE_WITHOUT` is env-name
groups only (`cookbooks/cdo-apps/recipes/bundle_bootstrap.rb:10-14`).

## Gems

| Gem | Gemfile | Non-pegasus consumers | Disposition |
|---|---|---|---|
| `sinatra` | :52 | `dashboard/legacy/middleware/*` (5 apps, sinatra-port series deletes), `shared/middleware/shared_resources.rb` (this plan, change 3), `lib/cdo/sinatra.rb` (only consumed by the 5 apps), `lib/cdo/pegasus/actionview_sinatra.rb` (only its own test), `lib/test/cdo/pegasus/test_graphics.rb` | remove in change 11 (needs external series + change 3) |
| `sinatra-contrib`, `rack` (direct), `rack-contrib` | — | not in Gemfile/lock | n/a |
| `rack_csrf` | :77 | zero consumers repo-wide | delete now (change 1) |
| `sequel` | :254 | DASHBOARD_DB consumers (below) | KEEP |
| `mysql2` | :54 | AR adapter, Sequel adapter, `Mysql2::Error` rescues | KEEP |
| `redcarpet` | :216 | dashboard helpers, text_to_speech, lib/cdo/markdown | KEEP |
| `sass` (transitive, lock 3.7.4 via bootstrap-sass + scss_lint) | — | `Sass::Plugin::Rack` ONLY in shared_resources.rb | usage removed by change 3; gem stays transitive |
| `sass-rails`/`sassc-rails` | :172,:176 | dashboard asset pipeline | KEEP |
| `thin` | :101 (dev/test) | ONLY `bin/pegasus-server:11` | delete now (change 1) |
| `rerun` | :100 | `bin/dashboard-server:15-19` | KEEP |
| `parallel_tests` | :143 | dashboard test infra, ui runner, test.rake | KEEP; fix stale "pegasus PDF" comment :142 |
| `pdf-reader` | :144 | zero consumers repo-wide | delete now (change 1) |
| `open_uri_redirections` | :151 | `lib/cdo/tempfile.rb` → `lib/pdf/collate.rb` → curriculum_pdfs (live) | KEEP; fix stale comment :150 |
| `phantomjs` | :184 | `lib/pdf/collate.rb` (live); `screencap.rb` (dead) | KEEP |
| `pusher` | :307 | netsim PusherApi (relocates to dashboard/lib in port series); `CDO.use_pusher` in `levels_helper.rb:626` | KEEP |
| `jumphash` | :59 | sharded_redis_factory (relocates in port series) | KEEP |
| `xxhash` | :66 | sharded_redis_factory AND pd survey_pipeline | KEEP |

### sequel consumers on DASHBOARD_DB (why the gem stays)

`lib/cdo/db.rb:13`; `lib/cdo/sequel.rb`;
`dashboard/lib/contact_rollups_v2.rb:3-62` (+
`contact_rollups_pardot_memory.rb:137`);
`dashboard/lib/projects_list.rb:64,131-145`;
`projects_controller.rb`; `shared/middleware/helpers/storage_id.rb:193,219`;
`dashboard/legacy/middleware/helpers/{projects,user_helpers,auth_helpers,bucket_helper}.rb`;
`lib/cdo/csv.rb`; `bin/oneoff/platform/backfill_cap_user_events.rb`;
two historical dashboard migrations. `lib/cdo/geocoder.rb` does NOT
use Sequel.

## Config keys (config.yml.erb)

| Key | line | Consumers | Disposition |
|---|---|---|---|
| `pegasus_honeybadger_api_key` | :151 (+ config/test.yml.erb:26, development.yml.erb:36) | none | delete now |
| `build_pegasus` | :426 (+ k8s/docker/locals.rake-build.yml:13) | build.rake:217, install.rake:80 | change 9 |
| `override_pegasus` | :445 (+ bootstrap_chef_stack.sh.erb:136) | `lib/cdo.rb:91` canonical_hostname, `dashboard/test/test_helper.rb:61,98` | rename (change 10) |
| `pegasus_hostname` | :446 (+ bootstrap_chef_stack.sh.erb:108) | `lib/cdo/aws/cloudfront.rb:37` (code.org CF aliases) | rename (change 10) |
| `pegasus_host` | :447 | only ui-test `steps.rb:75` (UrlConverter) | delete after cucumber cleanup / change 1 |
| `pegasus_sock`, `pegasus_web_server_name` | :448,:450 | none | delete now |
| `pegasus_port` | :449 | `lib/cdo.rb:133` site_host('code.org') dev/CI port, `bin/pegasus-server:11`, `application_helper_test.rb:57` | rename/rework (change 10) |
| `pegasus_workers` | :451 | none | delete now |
| `pegasus_db_name` | :583 | move_user_storage_ids oneoff, `bin/mysql-client-pegasus-*`, `shared/rake/test.rake:9`, `lib/cdo/aws/dms.rb:9`, USE_PEGASUS_UNITTEST_DB machinery | change 8 |
| `pegasus_db_reader/writer` | :591-592 | `lib/cdo/db.rb:7`, `pegasus/rake/db.rake:40,51`, 2 oneoffs, `shared/test/test_cdo.rb:19-20` | change 8 |
| `allowed_iframe_ancestors` | :374 embeds `<%=pegasus_site_host%>` | CSP | change 10 |
| Gatekeeper `pegasus_read_replica` | lib/cdo/sequel.rb:79 | read-splitting | change 8 |
| Poste keys (`poste_host`, `poste_smtp_*`, `poste_secret`, `poste_attachment_dir`) | :342-347 | poste.rb | KEEP (email system persists) |

## cookbooks/

- `cdo-apps/recipes/pegasus.rb:1-30` — teardown recipe (stops/removes unit). Keep until all prod instances converged once more, then delete with `default.rb:116` include
- `cdo-apps/recipes/default.rb:80` — `%w(dashboard pegasus)` log-dir loop
- `cdo-apps/recipes/jemalloc.rb:3` — same loop
- `cdo-apps/attributes/default.rb:12-15` — pegasus port 8081 attribute
- `cdo-apps/templates/default/crontab.erb:30-31` — dead pegasus_dir def
- `cdo-apps/recipes/logrotate.rb:2`, `templates/default/puma.service.erb:27` — comments
- `cdo-nginx/.kitchen.yml:18-19` — pegasus port test attribute (no refs in cdo-nginx recipes/templates)
- No cdo-varnish cookbook exists; ghost is `lib/cdo/legacy_varnish_helpers.rb` (consumed by cloudfront.rb + rack/allowlist.rb — KEEP)
- serverspec: `cdo-apps/test/integration/{default,daemon}/serverspec/ruby_spec.rb:11` comments

## aws/

- `cloudformation/bootstrap_chef_stack.sh.erb:17-18,108,136` — `PEGASUS_DOMAIN_NAME=code.org`, writes pegasus_hostname/override_pegasus into chef node JSON (change 10)
- `cloudformation/vpc.yml.erb:143-147,179-183,205-209` — three SG rules for "Pegasus Puma" port 9001; nothing listens — delete now
- `aws/dms/tasks.yml:33-44` — DMS replication of `pegasus.{contacts,forms,form_geos,hoc_activity,poste_deliveries}`; pairs with `lib/cdo/aws/dms.rb:9` schema list (changes 5-8; data-team coordination)
- `aws/emr/cdo-logs/script/tutorial_mapper.rb:6` — comment

## .github/workflows

- `dev_run_single_test.yml:39` — `rake test:changed:pegasus` (change 9)

## lib/cdo infra helpers

- `lib/cdo.rb:91` override_pegasus in canonical_hostname; `:133` pegasus_port in site_host; `:143-145` `pegasus_site_host`; `code_org_url` (:164) used ~57× in dashboard — rename carefully (change 10)
- `lib/cdo/honeybadger.rb:99,105` — pegasus HB project 34365 in get_recent_issues — delete now
- `lib/cdo/server_tools.rb:107,110` — production-pegasus ELB deregister — delete now (verify ELB gone)
- `lib/cdo/http_cache.rb:144-233` — `pegasus:` key = the code.org CloudFront distribution config, LIVE (Contentful marketing + dashboardapi proxying); `:hourofcode` maps onto it (`cloudfront.rb:177,199,248`) — rename (change 10)
- `lib/cdo/aws/cloudfront.rb:26,34-43,68-69,78,135,177,199,248` — `:pegasus` distribution + `CLOUDFRONT_ALIAS_CACHE = pegasus_dir('cache', ...)` — cache path moves in change 9; rename in change 10
- `lib/cdo/hamburger.rb:30,47-49,63-70,87,158,167,217` — `show_pegasus_options` = marketing-link visibility in header (consumed by `_header.html.haml`) — rename (change 10)
- `lib/cdo/url_converter.rb:13-42` — pegasus_host rewriting; only consumer Cucumber `steps.rb:73-75` — change 1
- `lib/cdo/app_server_hooks.rb:11` — change 8
- `lib/cdo/analytics/milestone_parser.rb:29-30,99` — change 9
- misc: `lib/cdo/mysql_console_helper.rb:20,28` (help text), `lib/dynamic_config/dcdo.rb:56` (aif-launch comment), `lib/cdo/google/drive.rb:160` ('Pegasus' gdrive sheet title), `lib/cdo/github.rb:12,40-49` (PEGASUS_DB_DIR), `config/i18n/locales.yml:12` (comment)

## dashboard/ remaining pegasus strings

- `dashboard/config/application.rb:55` — `origins CDO.pegasus_site_host` CORS for /dashboardapi (change 10; consider `MARKETING_SITES_HOSTS`, lib/cdo.rb:19-34)
- `dashboard/app/views/api/terms_interstitial_for_pegasus.html.haml` — zero references — delete now
- `teacher_dashboard/parent_letter.html.haml:27` — `pegasusOrigin` var (live code.org links) — rename only
- `levels/_unplug.html.haml:4-49` — `has_pegasus_lesson_plan/pdf` locals — cosmetic
- `contact_rollups_processed.rb:32,235-352` — `pegasus.forms`/`form_geos` keyed branches — change 7
- `dashboard/lib/pd/foorm/legacy_survey_summaries.rb:11-53` — `..._from_pegasus` names — cosmetic/change 7
- comments only: `application.js.erb:32`, `amazon_future_engineer_controller.rb:11`, `schools_controller.rb:40-41`, `followers_controller.rb:2`, `script_constants.rb:2`, `environment.rb:23`, `pii_scrubber.rb:107`, `certificate_image.rb:2`
- `dashboard/config/database.yml` — NO pegasus section
- `dashboard/config/environments/*` — no pegasus/poste refs (hook is application.rb:2 require)

## Rack middleware (pegasus-era, in dashboard boot)

`application.rb` requires :6-11, stack :95-116: `Rack::Optimize`,
five legacy apps + `SharedResources`, `Rack::UpgradeInsecureRequests`,
`Rack::CookieDCDO`, `Rack::Allowlist` + HttpCache.config,
`Rack::GeolocationOverride`. All `lib/cdo/rack/*` files STAY
(dashboard consumers); only their `cdo/pegasus/string` require moves
(change 2). `dashboard/config.ru` clean.

## i18n

`pegasus/cache/i18n/*.json` (~10 MB LFS, `.gitattributes:23,54`) has
zero in-repo consumers. Written by the EXTERNAL i18n sync ("pegasus
i18n updates" robo-commits; last real write 2025-11-05, 76869a30ce0).
Deleting requires turning off that external sync target first (D5).
Also k8s dockerignore pegasus rules
(`code-dot-org.dockerfile.dockerignore:32-33,50,152-154,183-184,382-401`).

## Extra findings

- `bin/pegasus-server`, `bin/pegasus-console` — dead (deleted router.rb); removing pegasus-server frees `thin`
- `bin/restart-pegasus-hoc2016`, `bin/restart-dashboard-and-pegasus-hoc2016`, `bin/check-memory-on-front-ends-hoc2016` — 2016 ops relics
- `bin/mysql-client-pegasus-{reader,writer,reporting}` — live DB tools until change 8
- `tools/customLinters/rubocop_pegasus_db_usage.rb` (change 8) + `rubocop_pegasus_requires.rb` (change 9)
- `lib/test/sequel_test_case.rb` uses `Sequel::Model.db` (= PEGASUS_DB via db.rb:10) — hidden coupling for change 6
