# Inventory: pegasus directory + pegasus_dir consumers (2026-07-07)

Produced by exhaustive repo sweep on branch
`stephen/pegasus-removal-plan`. Companion to `plan.md`. Line numbers
are as of this date and will drift.

Corrections to the 2026-06-30 inventory: the old `pegasus_dir` grep
was extension-filtered and missed 3 extensionless bin scripts
(`bin/force-gsheet`, `bin/pegasus-server`, `bin/pegasus-console`)
plus the `crontab.erb` template definition. It also missed the k8s
docker image pipeline, `lib/cdo/github.rb`, the `cdo/pegasus/string`
production dependency chain into dashboard middleware, and the ~50
bin/ scripts requiring `lib/cdo/pegasus/src/env.rb`. "Migrations are
all nop stubs" is false: 142 files, only 63 are `*_nop.rb`; 79 real.

## 1. pegasus_dir callsites

| file:line | what | disposition |
|---|---|---|
| `deployment.rb:83` | definition (`deploy_dir('pegasus', ...)`) | delete last, with pegasus/ |
| `cookbooks/cdo-apps/templates/default/crontab.erb:30-31` | local re-definition inside crontab template; no caller in template body | dead — delete def |
| `bin/force-gsheet:12` | `pegasus_dir('data', csv)` fallback + writes `PEGASUS_DB[:seed_info]` | dead — delete script |
| `bin/pegasus-server:5` | chdir + `thin start` of deleted Sinatra app | dead — delete |
| `bin/pegasus-console:5` | chdir + console for deleted app | dead — delete |
| `bin/oneoff/backfill_data/user_facilitator_bios.rb:12` | globs `sites.v3/**/*_bio.md` (deleted) | dead oneoff — delete |
| `dashboard/lib/certificate_image.rb:2` | stale comment only — file never calls it | fix comment; real dep is string.rb |
| `lib/cdo/test_run_utils.rb:174` | `run_pegasus_tests` chdir | delete with pegasus/ |
| `lib/cdo/analytics/milestone_parser.rb:29,30,99` | milestone S3 cache files under `pegasus/cache/` (sole consumer `bin/count-lines-of-code-from-milestone-logs_v2`) | move cache path or delete tool |
| `lib/cdo/aws/cloudfront.rb:78` | `CLOUDFRONT_ALIAS_CACHE = pegasus_dir 'cache', 'cloudfront_aliases.json'` (consumers: `lib/cdo/cloud_formation/cdo_app.rb:11`, `lib/rake/infra.rake:5`, `lib/cdo/rack/allowlist.rb:6`) | move cache path |
| `lib/cdo/pegasus/src/env.rb:12,16,20,24,28,38` | `cache_dir`/`sites_dir`/`sites_v3_dir`/`hoc_dir`/`src_dir` + logger to `pegasus/log/` — zero external callers of the helpers | delete with file |
| `lib/rake/build.rake:198` | `build:pegasus` chdir | delete task |
| `lib/rake/install.rake:68` | `install:pegasus` chdir | delete task |
| `pegasus/Rakefile:48`, `pegasus/rake/db.rake:7` | internal | delete with pegasus/ |
| `shared/middleware/shared_resources.rb:22,23,57` | Sass cache location + generated css under `pegasus/cache/css` | this plan, change 3 (shared-resources-port) |
| `shared/rake/test.rake:8` | `prepare_dbs` chdir → pegasus `db:ensure_created db:migrate` before shared tests | delete with pegasus/ |
| `shared/test/test_milestone_parser.rb:28` | test cache path | follows milestone_parser decision |

## 2. lib/cdo/pegasus.rb and lib/cdo/pegasus/ — files and consumers

`lib/cdo/pegasus.rb` is an umbrella: requires `array`,
`file_utility`, `hash`, `object`, `string`, `screencap`.

| file | external consumers | disposition |
|---|---|---|
| `pegasus.rb` | `bin/oneoff/export_pardot_contacts.rb:14` (dead oneoff), `src/env.rb:2`, 5 lib tests | delete after string.rb extraction |
| `string.rb` | PRODUCTION: `dashboard/lib/certificate_image.rb:6` (`force_8859_to_utf8`, line 131), `lib/cdo/rack/optimize.rb:2` (`include_one_of?` line 61 — mounted `application.rb:95-96`), `lib/cdo/rack/process_html.rb:4` (`include_one_of?` line 69 — base of `Rack::UpgradeInsecureRequests`, mounted `application.rb:109-110`); test `lib/test/cdo/pegasus/test_string.rb` | move `force_8859_to_utf8` + `include_one_of?`; rest (squish, to_bool, multiply_concat, ends_with?) unused |
| `graphics.rb` (requires `object.rb`) | `shared/middleware/shared_resources.rb:4`; test `lib/test/cdo/pegasus/test_graphics.rb` | port with change 3 |
| `properties.rb` (defines `Properties` on `PEGASUS_DB[:properties]`; also global `DB = PEGASUS_DB` at line 4) | `src/database.rb:3`; crons `bin/cron/geocode_hoc_activity:10`, `hoc_student_name_cleanup:26`, `update_project_count:13`; unscheduled `hoc_signup_counts:11`; manual `bin/upload_new_census_data_to_mapbox:20`; dead oneoff `import_concept_difficulty_tags.rb:4`; test `lib/test/cdo/pegasus/test_properties.rb` | relocate (change 2), migrate table (change 7) |
| `src/env.rb` | `pegasus/Rakefile:1` + 8 production-scheduled crons (crontab.erb line): `update_dotd` (57, staging), `delete_twilio_data` (95), `hoc_student_name_cleanup` (109), `deliver_poste_messages_process.rb` (137), `geocode_hoc_activity` (138), `form_geos` (139), `user_geos` (140), `update_project_count` (142); unscheduled `hoc_signup_counts`, `bin/solr/update_document` (gated on `CDO.solr_server`, likely dead); ~25 dead oneoffs (below) | crons drop the require (most only need `deployment` + `cdo/db`); delete file (change 2) |
| `src/database.rb` (geocode/zip helpers; requires `cdo/db`, `cdo/geocoder`, `properties`, `cdo/form`) | `pegasus/Rakefile:46` + same cron/oneoff population | relocate helpers (change 2) |
| `actionview_sinatra.rb` | only its test | dead — delete |
| `screencap.rb` + `screencap.js` | no caller of `generate_screencap` anywhere | dead — delete |
| `array.rb`, `hash.rb`, `object.rb`, `file_utility.rb` | only via umbrella + lib tests (`object.rb` also required by `graphics.rb`) | dead once umbrella gone |
| tests: `lib/test/cdo/pegasus/` (8 files) | — | delete/relocate with sources |

Dead oneoff/manual bin scripts requiring src/env and/or src/database
(all delete candidates): `move_user_storage_ids_to_dashboard.rb`,
`move_storage_apps_to_dashboard`,
`move_user_level_evaluations_to_student_work_evaluations.rb`,
`map-hoc-afterschool`, `send_missing_pd_workshop_surveys`,
`wipe_data/young_emails` (require path already broken),
`deprecate_unused_poste_urls.rb`,
`lookup_hoc2016_robotics_prize_names`,
`set_contained_level_results.rb`,
`update_pd_workshop_survey_ids.rb`,
`set_ai_tutor_available_for_csa_levels.rb`, `fix_on_form_bug`,
`import_coderdojo_classes`, `hoc_student_name_initial_cleanup`,
`drop_temp_views_from_pegasus`, `drop_forms_hoc_certificates_table`,
`export_pardot_contacts.rb`, `import_concept_difficulty_tags.rb`,
`backfill_data/{forms_hashed_email, form_geos,
contacts_hashed_email, storage_apps_project_type_and_standalone,
hoc_survey_prize_purpose, poste_deliveries_hashed_email,
user_facilitator_bios.rb}`; manual ops: `bin/load-gift-codes`,
`bin/k5-professional-development-survey-results`.

## 3. References to pegasus/{cache,data,migrations,Rakefile,rake} from outside

- `lib/cdo/github.rb:12,49` — `PEGASUS_DB_DIR = 'pegasus/migrations/'`; `pr_changed_files` DTS migration-PR filter
- `lib/rake/build.rake:196-211`, `lib/rake/install.rake:68-70`, `shared/rake/test.rake:8-11`, `lib/cdo/test_run_utils.rb:174-190` — chdir + invoke pegasus Rakefile (`pegasus:setup_db`, `db:ensure_created`, `db:migrate`, `test`)
- k8s: `k8s/docker/code-dot-org-pegasus.dockerfile` (`COPY pegasus pegasus`), `code-dot-org.dockerfile:15,205-207`, `code-dot-org-pegasus.dockerfile.dockerignore` (stale TODOs), `code-dot-org.dockerfile.dockerignore:50,183-184,385-398` (autogenerated from `pegasus/cache/.gitignore` by `k8s/docker/update-dockerignore-from-gitignore.rb`), `k8s/kustomize/skaffold.yaml:23,49,71,79,82,174,180,204` (artifact `code-dot-org-pegasus`, `mimic-pegasus`), `k8s/docker/README.md:23`, `k8s/docker/benchmark-skaffold-rebuilds/*`
- `aws/.gitignore:9-10` — `/.pegasus-built`, `/.pegasus-up-to-date` markers; nothing writes them
- lint config: `.haml-lint.yml:200-201`, `.haml-lint_todo.yml:65-81` (deleted sites.v3 files), `.config/rubocop/config.yml:27` (excludes `lib/test/cdo/pegasus/test_string.rb`)
- docs: `docs/pegasus-dashboard-integration.md` (whole file), `docs/importing-data.md:1,63`, `docs/pdf-lesson-plan-generation.md:44-68`, `docs/where-are-the-logs.md:7-11`, `docs/log-formats.md:231,372`, `README.md:41,56`, `CONTRIBUTING.md:27-28`, `SETUP.md:234`, `TESTING.md` (pegasus sections), `AGENTS.md` ("IGNORE the pegasus/ directory"), `shared/css/README.md:25,29`, `dashboard/app/models/census/README.md:11` (permalink, harmless), `bin/curriculum/import_hoc_lesson_plan.rb:119` (chdir into deleted sites.v3 — dead)
- `Gemfile:142,150` — stale "for pegasus PDF generation" comments on `parallel_tests`/`pdf-reader`/`open_uri_redirections`

## 4. Rake/build/CI integration

- `lib/rake/build.rake:196-211` `build:pegasus` (bundle_install; on daemon: `pegasus:setup_db`), `:217` gated on `CDO.build_pegasus` — default `true` in `config.yml.erb:426`, so every environment's build still bundles + migrates the pegasus DB today; also `k8s/docker/locals.rake-build.yml:13`
- `lib/rake/install.rake:65-73,80` `install:pegasus` (local envs)
- `lib/rake/lint.rake:16` — `haml-lint dashboard pegasus shared`
- `lib/rake/test.rake` — `test:pegasus` (354-357), `test:pegasus_qa` (285-292), `test:changed:pegasus` (479-495; glob includes `pegasus/**/*`, Gemfile, deployment.rb, lib/shared globs), `USE_PEGASUS_UNITTEST_DB` plumbing (210-309 — wraps dashboard/lib/shared test tasks too), registrations at 320, 575, 597
- `shared/rake/test.rake:6-13` `prepare_dbs`; per `test_run_utils.rb:180-184` pegasus tests depend on shared tests running first
- `.github/workflows/dev_run_single_test.yml:39` — `rake test:changed:pegasus`; `run_integration_tests.yml:30` — `rake test:changed` (pegasus leg implicit)
- `bin/content-push:7` — `CONTENT_PATHS = 'dashboard pegasus aws/dms'`
- `tools/customLinters/rubocop_pegasus_requires.rb` (requires into `../pegasus/`) — dies with dir; `rubocop_pegasus_db_usage.rb` (PEGASUS_DB const) — dies with DB

## 5. .gitattributes / LFS

- `:23` `pegasus/cache/i18n/**` LFS (~60 tracked json); `:54` `en-US.json` merge-driver exception; `:24-25,55-65,85-87` dead `pegasus/sites*` patterns

## 6. pegasus/migrations

142 files: 63 nop stubs, 79 real (create forms/contacts/poste_*/
properties/seed_info/hoc_activity, later drops). Runner:
`pegasus/rake/db.rake` `Sequel::Migrator.run(DB, pegasus_dir('migrations'))`;
version in `schema_info` table inside the pegasus DB. `DB` reaches
db.rake via `pegasus/Rakefile` → `cdo/pegasus/src/database` →
`properties.rb:4` (`DB = PEGASUS_DB`). Migration removal couples to
removing the rake entry points (build/install/shared-test), not to
production DB retirement.

## 7. bin/ and tools/ (beyond §2)

- Dead with pegasus/: `bin/pegasus-server`, `bin/pegasus-console`, `bin/force-gsheet`, `bin/curriculum/import_hoc_lesson_plan.rb:119`
- `bin/count-lines-of-code-from-milestone-logs_v2` — milestone_parser consumer
- `lib/cdo/sequel.rb:98-100` — stale comment referencing bin/pegasus-server
- DB/hostname-scope (changes 8/10): `bin/mysql-client-pegasus-{reader,writer,reporting}`, `bin/cron/confirm_usage`, `bin/update-contact-email`, `bin/oneoff/wipe_data/poste_deliveries_and_contacts_emails`, `bin/oneoff/geocode-mailing-list-nyc`, `bin/oneoff/rename-projecturl-to-level`, `bin/oneoff/unsent_pl_emails_enumerate.rb`, `bin/oneoff/generate_legacy_survey_summaries.rb`, `bin/oneoff/migrate_db:57`, `bin/ops/puma-stats.sh`, `bin/cron/restart_high_memory_frontend_services:68`, `bin/restart_host:4`, `bin/restart-pegasus-hoc2016`, `bin/restart-dashboard-and-pegasus-hoc2016`, `bin/oneoff/gh-ost_migrations/2022-12-15_*.sh`
