# Pegasus Removal Plan

Full removal of the pegasus subsystem: the `pegasus/` directory, the
`lib/cdo/pegasus/` library tree, the pegasus MySQL database, the last
Sinatra app in the Rack stack (`SharedResources`), and the gems and
infrastructure wiring that exist only to serve them. Every remaining
live behavior moves into dashboard.

Supersedes the 2026-06-30 version of this document. Verified against
the tree on 2026-07-07 (branch `stephen/pegasus-removal-plan`) by
three exhaustive inventories: `pegasus_dir`/directory consumers,
per-table `PEGASUS_DB` consumers, and gem/infra references.

## What changed since the last plan

- Phase 1 (data CSVs, StaticModels, Donor/DonorSchool) **landed on
  staging** as deletion, not relocation (#73597). The local
  `openspec/changes/remove-pegasus-dead-data/` dir is a completed
  leftover; archive it.
- The Sinatra middleware port is now its own 7-change series
  (`openspec/changes/sinatra-port-*`, PR #73697). It deletes the five
  apps in `dashboard/legacy/middleware/` but explicitly **keeps
  `SharedResources`**, the storage helpers, and all Sequel-on-
  DASHBOARD_DB code. This plan depends on that series only for the
  final `sinatra` gem removal.
- `storage_apps`/`user_storage_ids` are **not** in the pegasus DB
  (channels live in `dashboard.projects`). The pegasus DB migration
  does not touch the project-storage layer.
- Stale claims corrected: no `cdo-varnish` cookbook exists; no
  pegasus section in `dashboard/config/database.yml`; no
  `pegasus_reporting_db_*` config keys; migrations are NOT all nops
  (79 of 142 are real); `pegasus/rake/seed.rake` already gone.

## Current state (2026-07-07)

```
pegasus/                    ~11 MB, 223 files
├── Rakefile                pidfile guard + loads rake/*.rake
├── cache/i18n/             ~60 LFS json (~10 MB), zero readers; the CI
│                           i18n sync that wrote it was removed May 2026
├── data/                   empty (contents deleted upstream)
├── migrations/             142 files (79 real, 63 nop) — the schema
│                           source for pegasus DB in dev/test/CI
├── rake/db.rake            Sequel::Migrator entry points
├── rake/test.rake          test:reset_dependencies
├── test/test_helper.rb
└── log/                    empty
```

The pegasus DB is a **sibling schema on the same Aurora cluster** as
dashboard (`config.yml.erb:591-592` derives `pegasus_db_reader/writer`
from the same `db_reader`/`db_writer` endpoints). 48 tables exist;
live consumers touch only: `contacts`, `poste_deliveries`,
`poste_messages`, `poste_opens` (delete-only), `hoc_activity`,
`forms` (purge-only), `form_geos`, `properties`. Everything else
(30 `cdo_*` tables, `beyond_tutorials`, `poste_clicks`,
`channel_table_metadata`, `hoc_survey_prizes`, `hoc_learn_activity`,
`geography_us_zip_codes`, `seed_info`) has zero code references and
dies with the schema.

Live production surfaces backed by pegasus code or DB:

1. **Transactional email.** `Poste2::DeliveryMethod` (`lib/cdo/poste.rb`)
   is the ActionMailer delivery method in development, staging, and
   production. Enqueue writes `contacts` + `poste_deliveries` +
   `poste_messages`; the `deliver_poste_messages` cron drains via SMTP
   every minute.
2. **Hour of Code tracking + certificates.** The `hoc_legacy` engine
   reads/writes `hoc_activity` from live controller routes.
3. **Account purge / PII scrub.** `DeleteAccountsHelper`,
   `AccountPurger`, `User::PiiScrubberJob` (nightly) delete/anonymize
   rows in `contacts`, `poste_*`, `forms`, `form_geos`.
4. **`/shared/css|images|wasm`.** Served by `SharedResources`
   (`shared/middleware/shared_resources.rb`), the sixth Sinatra app,
   still mounted in `application.rb:104`. Runtime Sass compilation
   into `pegasus/cache/css` via the dead Ruby `sass` gem; image
   processing via `lib/cdo/pegasus/graphics.rb`. URLs referenced
   across dashboard views and apps/.
5. **Production crons** (crontab.erb): `deliver_poste_messages`,
   `confirm_usage`, `geocode_hoc_activity`, `form_geos`,
   `hoc_student_name_cleanup`, `update_project_count` touch the DB;
   `user_geos`, `delete_twilio_data`, `update_dotd` merely require
   `cdo/pegasus/src/env`.
6. **Rack middleware string deps.** `Rack::Optimize` and
   `Rack::UpgradeInsecureRequests` (both in the production stack) and
   `dashboard/lib/certificate_image.rb` use monkeypatches from
   `lib/cdo/pegasus/string.rb` (`include_one_of?`,
   `force_8859_to_utf8`).
7. **DMS → Redshift.** `aws/dms/tasks.yml:33-44` replicates
   `pegasus.{contacts,forms,form_geos,hoc_activity,poste_deliveries}`
   to the analytics cluster.
8. **Marketing-site config named "pegasus".** `CDO.pegasus_site_host`,
   `override_pegasus`, `pegasus_hostname`, `pegasus_port`, the
   `:pegasus` blocks in `lib/cdo/http_cache.rb` and
   `lib/cdo/aws/cloudfront.rb`, `hamburger.rb`
   `show_pegasus_options` — all of this now describes the **live
   code.org marketing site** (Contentful) and its CloudFront
   distribution. Rename territory, not delete territory.

## Known defects surfaced by the inventory (exist today, pre-plan)

- The `confirm_usage` production cron (every minute) asserts a
  `forms` row was created in the last 60 minutes, but no production
  code writes `forms` anymore. Either it is red right now or its
  alerting is dead.
- Not a defect, but confirmed dead machinery: `Deliverer#send`
  computes `/u/<encrypted-id>` unsubscribe and `/o/<encrypted-id>`
  tracking-pixel URLs (`poste.rb:234-242`) and passes them as ERB
  locals — but the only template ever enqueued
  (`Poste2::DeliveryMethod#deliver!` hardcodes `'dashboard'`;
  `lib/cdo/poste/emails/dashboard.html` is the only file on disk)
  interpolates only `body` + header fields. The links never appear
  in sent email. They date from the marketing-email era, which no
  longer sends via Poste. No compliance exposure; pure dead code.

## Decision points (need resolution before the affected change)

**D1 — RESOLVED 2026-07-07 (static analysis).** The unsubscribe/
tracking links are unrendered dead locals, not live email content.
Change 4 is pure deletion: strip `unsubscribe_link`/`tracking_pixel`
emission, `Poste.unsubscribe`, the encrypt/decrypt-id helpers if the
links were their only consumer, and the broken `confirm_usage`
forms-freshness check. `poste_opens` (delete-only) can be
archive-and-dropped in change 6 without replacement.

**D2 — forms/form_geos disposition (data team).**
Nothing writes them; live consumers are the PII-scrub anonymizers,
the no-op `form_geos` geocode cron, and DMS replication into
`pegasus_pii` on Redshift. Verified: `ContactRollupsV2#collect_contacts`
extracts only dashboard tables — the `pegasus.forms` branches in
`contact_rollups_processed.rb` are unreachable. In-repo Redshift
views DO read `pegasus_pii.forms`
(`aws/redshift/views/csf_workshop_attendance_view.sql:133,318`,
`csf_teachers_trained.sql`, `tables/school_activity_stats.sql`) —
historical CSF workshop location data, frozen since forms writes
stopped. The privacy wrinkle: account purges reach Redshift only
via DMS replication of the anonymizing UPDATEs; any option that
stops replication while keeping a Redshift copy also stops purge
propagation. Options: (a) drop MySQL table + DMS entry, data team
either drops the Redshift copy (breaks 3 views) or owns a frozen
snapshot with its own purge story; (b) migrate to dashboard schema
read-only, keep replication + purge propagation. Recommendation:
(a) with data-team sign-off; the views are historical reporting.
Affects change 7.

**D3 — RESOLVED 2026-07-07 (precedent).** Same-cluster is proven by
history, not just config: `bin/oneoff/move_user_storage_ids_to_dashboard.rb`
already performed a cross-schema `RENAME TABLE` in production —
impossible across servers — and `config.yml.erb` derives both
schemas from one endpoint. Mechanics per that precedent: atomic
`DB.rename_table(:pegasus__t, :dashboard__t)` + `CREATE VIEW
pegasus.t AS SELECT * FROM dashboard.t` covering the deploy gap
(MySQL simple views are updatable, so old code's writes pass
through), deploy repointed code, drop view; `--revert` inverse.
Changes 5-7 each ship the oneoff + AR migration (create-if-absent
for dev/test/CI, where the rename never ran) + schema.rb dump.

**D4 — Marketing-config rename scope (user).**
The `pegasus_*` hostname/CDN/hamburger config is live marketing-site
plumbing. Verified blast radius: the `:pegasus` key in
`HTTP_CACHE`/`CloudFront::CONFIG` is a Ruby symbol; no CloudFormation
logical ID derives from it in-repo (the only in-repo
`cloudfront_config(...)` call builds the Dashboard distribution;
adhoc stacks don't build a pegasus one). A rename is code-level —
keep alias lists and AWS-side names byte-identical, and carry the
`:hourofcode → :pegasus` behavior mapping (`cloudfront.rb:177,248`)
along. In scope as change 10, or out of scope leaving the fossil?
Recommendation: in scope, last, low priority.

**D5 — RESOLVED 2026-07-07 (static analysis).** The writer was this
repo's own CI i18n pipeline, not an external system, and #72803 +
#72846 (May 2026) removed every pegasus reference from `bin/i18n`
and `i18n/` — last robo-write was 2025-11-05. Nothing recreates the
files. Change 9 deletes `pegasus/cache/i18n/**` + the
`.gitattributes` LFS rules with no external coordination.

**D6 — Poste: parity-move vs. replace (user/product).**
With D1 resolved, Poste's surviving surface is: `contacts` dedup
(`ensure_recipient`), the `poste_deliveries` queue drained by a
per-minute cron (500k batch, ≤50 threads, SMTP retry, post-send
student-email scrub, OTel Sent/Abandoned/Queued metrics), and one
pass-through template. A replacement path exists: production
ActiveJob is `delayed_job` (durable, ActiveRecord, dashboard schema)
— `delivery_method :smtp` + job-wrapped delivery would delete
~600 lines and skip the two hardest table migrations. What
replacement loses: `poste_deliveries` as the per-user email audit
log (DMS-fed to `pegasus_pii` on Redshift) and the `contacts` feed —
product/data questions strict parity avoids. Recommendation:
parity-move (change 6 as written); note replacement as future work
once the tables are safely in the dashboard schema — the two are
not exclusive, and the move unblocks the directory/gem teardown
either way. Affects change 6.

**Settled scope facts** (not decisions, but confirm expectations):
the `sequel` and `mysql2` gems **stay** — `DASHBOARD_DB`,
contact_rollups_v2, projects_list, and the storage helpers the
sinatra-port series keeps all use Sequel against the dashboard DB.
"Gem removal" here means: `sinatra` (+ `lib/cdo/sinatra.rb`),
`rack_csrf`, `pdf-reader`, `thin`, and the `Sass::Plugin::Rack`
usage (the `sass` gem itself remains transitive via `bootstrap-sass`
and `scss_lint`). `pusher`/`jumphash` stay (their consumers relocate
to `dashboard/lib/` in the port series). `shared/haml`, `shared/css`
sources, fonts, and partials stay where they are — they are dashboard
content; only the serving middleware changes.

## Changes

Each becomes one OpenSpec change (proposal/design/specs/tasks),
implemented autonomously by Sonnet/Haiku. Order within tiers is free;
tiers are dependencies.

**As proposed 2026-07-07** (13 changes under `openspec/changes/`;
deviations from the numbered list below): change 2 became
`pegasus-core-ext-extraction` (scope grew: `Object#nil_or_empty?` is
live across dashboard via the SharedResources require chain and its
only definition was `pegasus/object.rb`; `String#to_bool` likewise —
sole definition, live controller callers); change 2's cron half is
`pegasus-cron-detach`; change 7 split into `pegasus-db-properties` +
`pegasus-db-forms-drop` (isolates the data-team gate); the
build/test/CI rake wiring moved from change 9 into
`pegasus-db-retire` (it is DB-creation plumbing — after retire the
directory is invoke-free); `poste-links-fix` became
`pegasus-poste-dead-links` per resolved D1 and also owns the
`List-Unsubscribe`/`X-Unsubscribe-Web` header removal (found late:
those DO ship in every email, pointing at the dead /u/ URL) and the
dead `form_id` template branch (unblocks db-poste's blanket
repoint). `pegasus_read_replica` Gatekeeper flag: NOT removable —
despite the name it gates read-splitting for all pools including
DASHBOARD_DB; documented fossil.

Change dirs: `pegasus-dead-code-sweep`, `pegasus-core-ext-extraction`,
`pegasus-cron-detach`, `pegasus-shared-resources-port`,
`pegasus-poste-dead-links`, `pegasus-db-hoc`, `pegasus-db-poste`,
`pegasus-db-properties`, `pegasus-db-forms-drop`,
`pegasus-db-retire`, `pegasus-directory-removal`,
`pegasus-marketing-rename`, `pegasus-gem-final-sweep`.

### Tier 0 — housekeeping

**0. Archive `remove-pegasus-dead-data`** — landed upstream; archive
the change dir.

### Tier 1 — independent, low risk

**1. `pegasus-dead-code-sweep`** — pure deletion, zero behavior
change. Delete: `bin/pegasus-server`, `bin/pegasus-console`,
`bin/force-gsheet`, `bin/restart-pegasus-hoc2016`,
`bin/restart-dashboard-and-pegasus-hoc2016`,
`bin/check-memory-on-front-ends-hoc2016`, ~25 dead oneoffs (list in
inventory), `lib/cdo/languages.rb` + its stale require in
`levels_helper.rb:7`, `lib/cdo/pegasus/{actionview_sinatra,screencap}.rb`
+ `screencap.js`, `dashboard/app/views/api/terms_interstitial_for_pegasus.html.haml`,
`lib/cdo/url_converter.rb` pegasus branch (or whole file if Cucumber
steps are its only consumer), `Poste2.find_or_create_url` (no
callers), gems `rack_csrf`, `pdf-reader`, `thin`, config keys
`pegasus_honeybadger_api_key`, `pegasus_workers`, `pegasus_sock`,
`pegasus_web_server_name`, honeybadger project 34365 in
`honeybadger.rb`, `production-pegasus` ELB in `server_tools.rb`
(verify gone in AWS), `crontab.erb:30-31` dead `pegasus_dir` def,
`aws/.gitignore` `.pegasus-built` markers, `vpc.yml.erb` port-9001
SG rules, stale comments (`certificate_image.rb:2`,
`lib/cdo/sequel.rb:98`, Gemfile comments).
Verify: rails boots, pre-commit, targeted tests for touched files.

**2. `pegasus-lib-extraction`** — relocate the live remnants of
`lib/cdo/pegasus/`:
- Move `include_one_of?` + `force_8859_to_utf8` monkeypatches from
  `string.rb` to a non-pegasus home (e.g. `lib/cdo/core_ext/string.rb`
  matching repo conventions); update `lib/cdo/rack/optimize.rb`,
  `lib/cdo/rack/process_html.rb`, `dashboard/lib/certificate_image.rb`;
  delete the rest of `string.rb` (squish/to_bool/etc. unused) and the
  `pegasus.rb` umbrella + `array/hash/object/file_utility.rb`.
- Detach the 8 production crons + unscheduled scripts from
  `cdo/pegasus/src/env` (most need only `deployment` + `cdo/db`);
  relocate the geocode helpers from `src/database.rb` and the
  `Properties` class from `properties.rb` to `lib/cdo/` (still on
  PEGASUS_DB for now; note `properties.rb:4` defines global
  `DB = PEGASUS_DB` — kill the global, fix `pegasus/Rakefile`'s
  require chain to keep `db.rake` working until Tier 4).
- `graphics.rb` stays until change 3 removes its consumer.
Verify: rails boots, `bundle exec rake -T` in pegasus/ still works,
cron scripts load cleanly, lib tests moved/updated.

**3. `shared-resources-port`** — port the sixth Sinatra app to
dashboard, strict-parity in the spirit of the sinatra-port series:
`/shared/css/*` (decide in design: build-time Sass compile to a
static dir vs. Rails controller; must preserve exact paths and the
DCDO-tunable `Cache-Control` values from `pegasus_*_max_age` keys),
`/shared/images/*` (port `lib/cdo/pegasus/graphics.rb` processing to
a dashboard home), `/shared/wasm/*.wasm`. Remove `SharedResources`
from `application.rb`, delete `shared/middleware/shared_resources.rb`,
`Sass::Plugin::Rack` usage, and the `pegasus/cache/{css,.sass-cache}`
paths. Verify: byte/header parity harness against the old responses
for representative css/image/wasm URLs, UI smoke.

**4. `poste-dead-links-removal`** — per resolved D1, pure deletion:
strip `unsubscribe_link`/`tracking_pixel` locals from
`Deliverer#send` (`poste.rb:234-242`), delete `Poste.unsubscribe`
(:85-111, no callers), delete the encrypt/decrypt-id helpers if the
links were their only consumer, remove the `forms` freshness check
from `bin/cron/confirm_usage:22` (keep the `poste_deliveries`
backlog check). Verify: send a staging email end-to-end, body
unchanged; `test_poste` suite green.

### Tier 2 — pegasus DB table migration (mechanics per resolved D3)

Per-table pattern: AR migration creating the table in the dashboard
schema (dev/test/CI), documented ops `RENAME TABLE` for
prod/staging/adhocs, repoint code from `PEGASUS_DB` to
`DASHBOARD_DB`, update DMS `tasks.yml`, verify. Sequel stays;
AR-ification is not a goal.

**5. `pegasus-db-hoc`** — `hoc_activity`: repoint the `hoc_legacy`
engine (session_manageable, certificates_controller, tutorial
services) and crons `geocode_hoc_activity`,
`hoc_student_name_cleanup`. Move their `properties` cursors in the
same change or leave for 7. DMS entries `tasks.yml:36-43`.

**6. `pegasus-db-poste`** — `contacts`, `poste_deliveries`,
`poste_messages`, `poste_opens` (or drop opens if D1 stripped the
pixel — it is delete-only today), drop dead `poste_urls`/`poste_clicks`.
Repoint `lib/cdo/poste.rb`, `bin/cron/deliver_poste_messages_process.rb`,
`bin/cron/confirm_usage`, `lib/cdo/delete_accounts_helper.rb`,
`dashboard/lib/account_purger.rb` (`PEGASUS_DB.transaction`),
`pii_scrubber`, test infra (`lib/test/sequel_test_case.rb` uses
`Sequel::Model.db` = PEGASUS_DB — the hidden global in `db.rb:10`
must be removed/repointed here), `poste_assertions`, `test_poste`.
DMS `tasks.yml:33,44`. Highest-risk change in the plan: the email
queue migrates while the per-minute drain cron runs. Design must
sequence enqueue-repoint vs. drain-repoint (same deploy; queue
drains to empty within minutes — an ops runbook task).

**7. `pegasus-db-forms-properties`** — resolve D2 for
`forms`/`form_geos` (recommended: archive-and-drop + delete
anonymizers, `form_geos` cron, `hoc_signup_counts`, vestigial
`contact_rollups_processed.rb:235-352` branches, `lib/cdo/form.rb`
render path, DMS `tasks.yml:34-35`); move `properties` (cron
self-state only: `update_project_count`, geocode cursors) and delete
its dead public read API (`fetch_metrics` etc., no callers).

### Tier 3 — DB retirement

**8. `pegasus-db-retire`** — zero PEGASUS_DB consumers remain. Remove
`PEGASUS_DB`/`POSTE_DB` constants (slim `lib/cdo/db.rb` to
DASHBOARD_DB), `app_server_hooks.rb` disconnect, config keys
`pegasus_db_name/reader/writer`, `USE_PEGASUS_UNITTEST_DB` machinery
in `lib/rake/test.rake` (careful: it wraps dashboard/lib/shared test
tasks too), `bin/mysql-client-pegasus-{reader,writer,reporting}` +
`mysql_console_helper.rb` help text, Gatekeeper flag
`pegasus_read_replica`, `CustomCops/PegasusDbUsage` cop + its
exemption comments, `lib/cdo/aws/dms.rb:9` schema list, remaining
DB-touching oneoffs. Ops task: drop the `pegasus_*` schemas after a
quiet period; redshift views are the data team's.

### Tier 4 — directory + build system

**9. `pegasus-directory-removal`** — depends on 2, 3, 8 (and D5
executed). Delete `pegasus/` entirely (migrations, rake, Rakefile,
test, cache incl. LFS i18n json). Remove: `build_pegasus` key +
`lib/rake/build.rake:196-217` + `lib/rake/install.rake:66-80`,
`test:pegasus`/`test:changed:pegasus`/`test:pegasus_qa` in
`lib/rake/test.rake` + `.github/workflows/dev_run_single_test.yml:39`,
`shared/rake/test.rake` prepare_dbs, `lib/cdo/test_run_utils.rb`
pegasus paths, `lib/rake/lint.rake:16` haml-lint arg,
`lib/cdo/github.rb` `PEGASUS_DB_DIR`, `bin/content-push` path token,
k8s: `code-dot-org-pegasus.dockerfile` + dockerignores + skaffold
wiring + dockerignore generator input, `.gitattributes` pegasus rules
(i18n LFS + dead sites* patterns), `.haml-lint.yml`/`_todo` excludes,
`.config/rubocop/config.yml:27` exclude,
`tools/customLinters/rubocop_pegasus_requires.rb`, `deployment.rb:83`
`pegasus_dir` (last), relocate the two cache paths that outlive
pegasus/: `lib/cdo/aws/cloudfront.rb:78` alias cache and
`lib/cdo/analytics/milestone_parser.rb` caches (→ `dashboard/tmp` or
scratch; or delete the milestone tool with user sign-off).
Verify: `rake -T`, full build (`rake build`), dashboard boots, CI
green.

### Tier 5 — names and gems (parallel, independent of each other)

**10. `pegasus-marketing-rename`** (if D4 = in scope) — rename-only:
`pegasus_site_host` → `code_org_site_host` (or similar),
`override_pegasus`, `pegasus_hostname`, `pegasus_port`,
`http_cache.rb` `:pegasus` block, `cloudfront.rb` `:pegasus`
distribution + log prefix, `hamburger.rb` `show_pegasus_options`,
CORS origin in `application.rb:55` (consider `MARKETING_SITES_HOSTS`),
`bootstrap_chef_stack.sh.erb`, cookbooks (`cdo-apps` recipes
default/jemalloc loops, attributes port 8081, teardown recipe
`pegasus.rb` once all prod instances have converged, cdo-nginx
`.kitchen.yml`), `parent_letter.html.haml` `pegasusOrigin`,
`_unplug.html.haml` locals, UI-test steps.rb. Needs
staging/adhoc converge verification; touches chef + CFN templates.

**11. `pegasus-gem-final-sweep`** — depends on the **external**
sinatra-port series completing (middleware teardown) + change 3.
Remove `sinatra` gem, `lib/cdo/sinatra.rb`, remaining
`lib/test/cdo/pegasus/` tests, fix stale Gemfile comments
(`parallel_tests`, `open_uri_redirections`), `dcdo.rb:56` aif-launch
note, docs sweep: `docs/pegasus-dashboard-integration.md` (delete),
`docs/{importing-data,pdf-lesson-plan-generation,where-are-the-logs,log-formats}.md`,
`README.md`, `CONTRIBUTING.md`, `SETUP.md`, `TESTING.md`,
`AGENTS.md` ("IGNORE the pegasus/ directory"), `shared/css/README.md`.
Final gate: `grep -ri pegasus` across the repo returns only
git history references and the marketing-rename fossils if D4 = out.

## Dependency graph

```
external: sinatra-port series ──────────────────────────────┐
                                                            │
tier 1:  [1 sweep]  [2 lib-extract]  [3 shared-res]  [4 poste-links]
                        │                 │                 │
tier 2:           [5 hoc]  [6 poste]  [7 forms/props]     (D1)
                      └───────┬──────────┘                  │
tier 3:                [8 db-retire]                        │
                              │                             │
tier 4:                [9 directory]  (needs 2,3,8)         │
                                                            │
tier 5:      [10 rename (D4)]         [11 gems+docs] ◄──────┘
                                       (also needs 3)
```

Changes 1-4 can be implemented immediately and in parallel worktrees.
Tier 2 needs D2 + D6 resolved. ~11 changes / ~15-20 PRs (tier 2
changes may split code-repoint and ops-rename PRs).

## Out of scope

- `sequel`/`mysql2` gem removal and any Sequel→ActiveRecord rewrite
  (DASHBOARD_DB consumers: contact_rollups_v2, projects_list, storage
  helpers — the sinatra-port series deliberately keeps these).
- The sinatra-port series' own scope (five middleware apps, /v3
  routes, storage helpers).
- `shared/haml`, `shared/css` sources, `shared/fonts`,
  `shared/partials` relocation — dashboard content, orthogonal to
  pegasus.
- Poste product changes beyond D1 (e.g. replacing Poste with SES) —
  strict parity move only.
- Redshift-side view/schema cleanup (data team, after DMS entries
  drop).
