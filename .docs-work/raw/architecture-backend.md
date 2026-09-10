# Backend / infrastructure subsystem map (raw research)

Coarse-grained map for developer-doc domain planning. Not a design doc; cite the file paths and follow up in the code for specifics.

### Rails app layout

Purpose: The Rails monolith (`dashboard/`) implementing studio.code.org — controllers, 350 models, curriculum config, and three mounted engines.
Dirs: `dashboard/app` (controllers, models, helpers, views, mailers, jobs, channels), `dashboard/lib` (Services::/Policies::/Queries:: PORO layer, see below), `dashboard/config`, `dashboard/engines/{cdo_contentful,hoc_legacy,observability}`, `dashboard/db`.
Entry points: `dashboard/config/application.rb` (boot: requires repo-root `deployment.rb`, `cdo/poste`, mounts six legacy Sinatra apps as Rack middleware — `FilesApi`, `ChannelsApi`, `SharedResources`, `NetSimApi`, `AnimationLibraryApi`, `SoundLibraryApi` — inserted after `Rails::Rack::Logger`/`Middleware::I18n`; sets `config.active_job.queue_adapter`, `config.cache_store = :file_store`, autoloads `app/models/{experiments,levels,sections}` plus repo-root `lib/` as top-level Zeitwerk namespaces); `dashboard/config.ru` (adds `Rack::SslEnforcer` in front of `Rails.application`); notable initializers: `devise.rb`, `session_store.rb`, `sentry.rb`, `statsig.rb`, `cdo_contentful.rb`, `zendesk.rb`, `lograge.rb`, `delayed_job_config.rb`, `zeitwerk.rb`.
Docs: none found at `dashboard/README.md` (does not exist).
External deps: MySQL (940 files in `dashboard/db/migrate`, `dashboard/db/schema.rb` is 3133 lines), Redis (session store), Vite (frontend-studio assets, `VITE_RUBY_ROOT`).
Uncertainties: the `stages` table is the legacy DB name for the `Lesson` model (established elsewhere, not re-derived here) — worth flagging in docs so newcomers don't search for a `stages.rb` model. Six Sinatra apps are mounted as Rack middleware, not requests routed through Rails proper — see "Sinatra middleware" section.

### Non-Rails Ruby (repo-root lib/ and shared/)

Purpose: Ruby code and static assets shared by both the Rails app (dashboard) and the legacy Sinatra app (pegasus, owned by another agent), so it lives above both instead of inside either.
Dirs: `lib/cdo` (the `CDO` global config object and per-integration subdirs: `aws`, `google`, `i18n`, `pegasus`, `poste`, `rack`, `redcarpet`, `video`, `analytics`, `contact_rollups`, `cloud_formation`), `lib/cron` (currently just `aurora_backup.rb`), `lib/dynamic_config` (feature-flag/experiment config, includes a DynamoDB adapter), `lib/forms`, `lib/pdf`, `lib/rake`; `shared/` holds cross-app static assets (`css`, `fonts`, `images`, `partials`) plus `shared/middleware` (the Sinatra `SharedResources` app) and `shared/haml`.
Entry points: `lib/cdo.rb` defines the `CDO` config-accessor object; `deployment.rb` (repo root) is required first thing by both `dashboard/config/application.rb` and `dashboard/config.ru`, and wires environment detection (`rack_env?`) before Rails boots.
Docs: none dedicated; `dashboard/legacy/README.md` explains the *dashboard-specific* legacy-code convention (adjacent concept, not the same directory).
External deps: none beyond what individual `lib/cdo/*` subdirs wrap (AWS SDK, Google APIs, etc — see integrations section).
Uncertainties: exact list of what still needs pegasus vs. what's dashboard-only in `shared/` wasn't fully enumerated (pegasus is another agent's territory); the boundary between `lib/` (Ruby code) and `shared/` (static/middleware) is a naming convention, not enforced by tooling.

### Auth

Purpose: Devise-based session auth on `User`, layered with five OmniAuth SSO providers and a separate LTI (school-LMS) integration.
Dirs: `dashboard/app/models/authentication_option.rb`, `dashboard/app/controllers/lti/`, `dashboard/app/models/lti*.rb` (`lti.rb`, `lti_course.rb`, `lti_deployment.rb`, `lti_integration.rb`, `lti_section.rb`, `lti_user_identity.rb`), `dashboard/lib/services/lti.rb` + `dashboard/lib/services/lti/`, `dashboard/lib/policies/lti.rb`, `dashboard/lib/queries/lti.rb`.
Entry points: `dashboard/config/initializers/devise.rb` (`Devise.setup`, registers `config.omniauth` for `:facebook`, `:google_oauth2`, `:microsoft_v2_auth`, `:clever`, `:classlink`); `dashboard/app/models/user.rb` line 497 (`devise :invitable, :database_authenticatable, :registerable, :omniauthable, ...`) and `User.from_omniauth` (~line 1619); `dashboard/lib/single_sign_on.rb`; `dashboard/config/initializers/session_store.rb` (Redis-backed `RedisSessionStore`, cookie key `_learn_session`, **`domain: :all`** — the `.code.org`-wide cookie — `expire_after: CDO.dashboard_session_ttl_days.days`, plus two custom modules to reduce Redis writes and guard against a session-resurrection race).
Docs: `docs/server-sessions.md`.
External deps: Google OAuth2, Facebook, Microsoft (`microsoft_v2_auth`), Clever, ClassLink; Clever also has a dedicated initializer `dashboard/config/initializers/clever_client.rb`.
Uncertainties: did not verify how LTI's own auth (separate from Devise/OmniAuth — LTI platforms authenticate via LTI launch, not a Devise strategy) hands off into the same Devise session; Microsoft/Facebook/Google/Clever/ClassLink cover the five OmniAuth providers actually registered — no GitHub-style OAuth found despite a commented-out example in `devise.rb`.

### Authorization plumbing

Purpose: CanCanCan drives all `can?`/`authorize!` checks; `UserPermission` is the underlying enum-like grant a user can hold.
Dirs/entry points: gem `cancancan ~> 3.5.0` (`dashboard/Gemfile:180`); `dashboard/app/models/ability.rb`; `dashboard/app/models/user_permission.rb`.
Docs: none found.
External deps: none.
Uncertainties: contents of `ability.rb` and the permission enum are explicitly out of scope here (owned by another agent) — cite only.

### Curriculum data model

Purpose: The authoring/serving model for curriculum — a `CourseOffering`/`CourseVersion` groups `UnitGroup`s or standalone `Unit`s (aka Scripts), each built of `Lesson`s (legacy table name `stages`) containing `LessonActivity` → `ActivitySection` → `ScriptLevel` → `Level`/`LevelGroup`; the whole tree round-trips to flat files under `dashboard/config` so it can be authored, reviewed, and diffed in git.
Dirs: `dashboard/app/models/{unit_group,unit,lesson,lesson_activity,activity_section,script_level,course_offering,course_version}.rb`; `Level`/`LevelGroup` live in `dashboard/app/models/levels/` (already established); config data: `dashboard/config/courses/` (892 files), `dashboard/config/course_offerings/` (736 files), `dashboard/config/scripts/` (36228 files — per-level `.level`/`.external` etc, not just scripts), `dashboard/config/scripts_json/` (1779 `*.script_json` files).
Entry points: `Unit#serialize_seeding_json` (`dashboard/app/models/unit.rb:2023`) delegates to `Services::ScriptSeed.serialize_seeding_json` (`dashboard/lib/services/script_seed.rb`), which is the writer for `*.script_json`; `published_state` is a real column/attr on `CourseOffering`, `CourseVersion`, `UnitGroup`, `Unit` (and `QuizQuestion`); rake seed tasks live in `dashboard/lib/tasks/seed.rake` and `seed_in_test.rake` (task names weren't cleanly enumerable via grep — the file defines a custom `timed_task` wrapper around `task`, so names are inside `timed_task :name do ... end` blocks, not plain `task :name`).
Docs: `docs/update-levelbuilder.md`.
External deps: git itself is the "external dependency" — levelbuilder edits are written to the server's on-disk `dashboard/config/*` checkout and a separate process commits them back (evidence: recent repo history includes a `levelbuilder content changes (-robo-commit)` commit; no `git commit`/Octokit call was found inside the Rails app itself, so the commit+push step happens outside the request path, likely a cron/deploy-time job not in this codebase's Ruby — could not confirm exact mechanism).
Uncertainties: the robo-commit mechanism (who actually runs `git commit`/`git push` for levelbuilder edits, and how often) was not located in-app; may live in `cookbooks/`, `bin/`, or a k8s cronjob outside this search's scope.

### Progress and project storage

Purpose: Tracks a student's completion state per level/script, and stores the actual project blobs (App Lab/Game Lab/etc source) a student authors.
Dirs: progress: `dashboard/app/models/{user_level,user_script,level_source}.rb`; project storage: `dashboard/app/models/{project,project_commit,channel_token,project_storage}.rb`, `dashboard/app/models/project_storage/geo.rb`, `dashboard/app/jobs/project_storage/`, `dashboard/legacy/middleware/channels_api.rb` (Sinatra, the actual `/v3/channels` API), `shared/middleware/helpers/storage_id.rb`.
Entry points: `ChannelsApi` (Sinatra app in `dashboard/legacy/middleware/channels_api.rb`) is the request-facing channel/storage-id API, loaded as Rack middleware from `application.rb`; `ProjectStorage` model backs the `user_project_storage_ids` MySQL table and documents itself: "the blobs are stored in several S3 buckets depending on the blob type (e.g. `cdo-v3-sources/sources/<storage id>`, `cdo-v3-files/files/<storage id>`, etc.)" (`dashboard/app/models/project_storage.rb:27`).
Docs: `docs/projects-data-model.md`.
External deps: **CURRENT backing store is S3** (per the model comment above, and per the very recent `20260902042144_add_anon_user_id_to_user_project_storage_ids.rb` migration — this table is under active development, matching the recent DATA-317 commit in git log). DynamoDB exists in the codebase (`lib/dynamic_config/adapters/dynamodb_adapter.rb`) but only for feature-flag/experiment config, not project storage. No Firebase reference was found anywhere in `dashboard/` or `lib/`.
Uncertainties: none significant — S3-as-current is well evidenced; did not find any legacy alternate store to contrast against (no Dynamo/Firebase project-storage code exists to call "legacy").

### Labs runtime contract

Purpose: How a curriculum level becomes a running lab in the browser — a controller loads a `Level`, a helper flattens it plus session state into one JSON blob, and the page boots the shared apps bundle against that blob.
Dirs: `dashboard/app/controllers/script_levels_controller.rb`, `dashboard/app/models/levels/level.rb` (JSON `properties` column, decrypted via `Encryption.decrypt_object` when `encrypted_properties` is set), `dashboard/app/helpers/levels_helper.rb`.
Entry points: `LevelsHelper#app_options` (`dashboard/app/helpers/levels_helper.rb:208`) builds the `@app_options` hash (level metadata, script/section context, user prefs, experiments, feature flags); rendered into the page as the literal global `var appOptions = #{app_options.to_json};` in `dashboard/app/views/levels/show.html.haml:69,75` — confirms the global is named `appOptions`, camelCase, not `app_options`. The apps webpack bundle itself is located via the `rake package:apps:symlink` task and served from `dashboard/public/blockly` (documented in `apps/README.md`, not re-derived here).
Docs: `apps/README.md` ("Seeing your development version of Apps in Dashboard" section).
External deps: none beyond the apps webpack build itself.
Uncertainties: newer lab2-based labs (music lab, weblab2, pythonlab) may bypass some of this legacy `app_options` path in favor of their own bootstrap — `levels_helper.rb:259` has a comment "Backpack is used in lab2 apps also but app_options is only used by legacy labs," suggesting `app_options` itself is legacy-labs-only and lab2 has a parallel/different contract not investigated here.

### Background jobs

Purpose: ActiveJob-based async work (AI grading, podcasts, mail, roster sync, project-storage cleanup) backed by database-queue `delayed_job`, not Sidekiq or SQS.
Dirs: `dashboard/app/jobs/` — notable: `aichat_request_chat_completion_job.rb`, `ai_lesson_summaries_job.rb`, `ai_lesson_summary_podcasts_job.rb`, `ai_student_podcasts_job.rb`, `evaluate_challenge_response_job.rb`, `evaluate_rubric_job.rb`, `mail_delivery_job.rb`, `mailjet_delivery_job.rb`, subdirs `cap/`, `concerns/`, `inactivity_cleanup/`, `project_storage/`, `roster/`, `user/`.
Entry points: `config.active_job.queue_adapter = CDO.active_job_queue_adapter` (`dashboard/config/application.rb:276`); gem `delayed_job_active_record ~> 4.1` (`dashboard/Gemfile:376`); `dashboard/config/initializers/delayed_job_config.rb` configures per-queue priority from `CDO.active_job_queues` and disables delayed_job's own retry in favor of ActiveJob's.
Docs: none found.
External deps: MySQL (delayed_job's queue table lives in the main DB, no separate broker); no `whenever` gem found in `dashboard/Gemfile`, so cron-style scheduling is not Rails-managed — likely lives in `cookbooks/` (Chef) or a k8s cronjob, out of scope here.
Uncertainties: the actual worker deploy target (a dedicated worker process/role vs. inline in the web dyno) wasn't confirmed — no `Procfile` or worker-specific role file was found in this pass; `lib/cron/aurora_backup.rb` is the only file under repo-root `lib/cron`, so most "scheduled task" infrastructure is likely Chef/k8s-cron, not Ruby.

### Caching/CDN

Purpose: A single-node file-based Rails cache per app server, Redis reserved for sessions, and CloudFront as the actual CDN/HTTP cache layer in front of both apps.
Dirs/entry points: `config.cache_store = :file_store, Rails.root.join('tmp','cache')` (`dashboard/config/application.rb`, explicit comment: "Rails.cache is a local file system store shared by all Puma worker processes on a given web application server, which persists for the lifetime of the server" — i.e., not shared across servers); `config.assets.gzip = false # cloudfront gzips everything for us on the fly` (same file); `CDO.cdn_enabled` flag referenced at `dashboard/app/models/game.rb:296` (no literal `CDO.cdn` method was found — the task's guessed name doesn't exist verbatim); Sprockets is still present (`gem 'sprockets', github: 'code-dot-org/sprockets', ...` in `dashboard/Gemfile:35`, with a comment "In the long term, we probably want to migrate away from sprockets entirely") alongside the separate webpack "apps" bundle (`dashboard/public/blockly` symlink, see Labs runtime section) and a Vite pipeline for `frontend-studio` (see application.rb `VITE_RUBY_*` env vars).
Docs: none found specifically; the "studio deploy package" (TurboS3Packaging) referenced in prior work was already removed per project memory — not re-investigated.
External deps: CloudFront (HTTP cache/CDN layer, referenced only in comments, not configured in this repo — likely Terraform/CloudFormation owned elsewhere), Redis (sessions only, not general cache).
Uncertainties: no code-level CloudFront configuration was found in-repo (consistent with it being infra-as-code elsewhere, e.g. `aws/cloudformation`, not deeply explored here).

### Email

Purpose: ActionMailer with an in-house delivery backend (Poste2) for transactional mail, and Mailjet specifically for PD workshop mail.
Dirs: `dashboard/app/mailers/` — `application_mailer.rb`, `follower_mailer.rb`, `inactive_user_purge_mailer.rb`, `lti_mailer.rb`, `parent_mailer.rb`, `peer_review_mailer.rb`, `placeholder_mailer.rb`, `teacher_mailer.rb`, `pd/` subdir (includes `workshop_mailjet_mailer.rb`), plus `email_delivery_interceptor.rb`/`email_delivery_observer.rb`.
Entry points: `config.action_mailer.delivery_method = Poste2::DeliveryMethod` in `dashboard/config/environments/{production,staging,development}.rb` (Poste2 lives under `lib/cdo/poste/`, an in-house mail-sending layer — not a well-known third-party gem); `dashboard/config/initializers/email_delivery_watchers.rb` registers `EmailDeliveryInterceptor`/`EmailDeliveryObserver`.
Docs: none found.
External deps: Mailjet (only for `Pd::WorkshopMailjetMailer` / `MailjetDeliveryJob`, referenced from `dashboard/app/controllers/api/v1/pd/workshops_controller.rb` and `dashboard/app/models/pd/workshop.rb`); everything else goes through the homegrown Poste2 layer, whose ultimate downstream transport wasn't traced further.
Uncertainties: what Poste2 itself sends through (SMTP relay? another provider?) wasn't investigated — `lib/cdo/poste/` exists but its internals are outside this pass's depth budget.

### Observability

Purpose: A small Rails engine wrapping Sentry error reporting and OpenTelemetry instrumentation behind one internal API, per prior project work ("Observability::Errors.report").
Dirs: `dashboard/engines/observability/lib/observability/` — `engine.rb`, `errors.rb`, `opentelemetry.rb`, `sentry.rb`, `version.rb`; `dashboard/engines/observability/app/helpers`.
Entry points: `dashboard/config/initializers/sentry.rb` (only wires a Warden `after_fetch` hook to call `Observability::Sentry.set_user_id`, guarded by `Observability::Sentry.enabled?` — the bulk of Sentry setup is inside the engine itself, not the initializer); gem `lograge` (fork `code-dot-org/lograge`, ref `debug_exceptions`) for structured request logs, wired via `dashboard/config/initializers/lograge.rb`.
Docs: `docs/logging.md`, `docs/log-formats.md`, `docs/where-are-the-logs.md`.
External deps: Sentry, Honeybadger (`dashboard/config/honeybadger.yml` exists — both error trackers appear configured; relationship between the two wasn't resolved in this pass), OpenTelemetry.
Uncertainties: did not resolve whether Honeybadger is still live or a legacy holdover next to Sentry — both have config files present.

### i18n

Purpose: Locale strings for both the Rails app (`dashboard/config/locales`) and each JS lab (`apps/i18n/<labname>/<locale>.json`), covering roughly 30 languages per lab.
Dirs: `dashboard/config/locales` (56 entries — mix of files/dirs, not purely flat locale files), `apps/i18n/<labname>/` (one dir per lab: `applab`, `craft`, `music`, `weblab2`, `lab2`, etc, each with ~34 locale JSON files plus `en_us.json`), `config/i18n` at repo root (`locales.yml`, `cdo-languages.csv` — the canonical language/locale registry `Cdo::I18n::LOCALE_CONFIGS` referenced from `dashboard/config/application.rb`).
Entry points: `dashboard/config/application.rb` (`config.i18n.backend = CDO.i18n_backend`, `Cdo::I18n.available_languages`, `Cdo::I18n::LOCALE_FALLBACKS`/`LOCALE_ALIASES`); Global Edition region gating found at `lib/cdo/global_edition.rb`, `lib/cdo/brand.rb`, `lib/cdo/help_header.rb`, `lib/cdo/hamburger.rb`, `lib/cdo/rack/request.rb`, and rendered in `dashboard/app/views/layouts/{_header,_footer,application}.html.haml` (matches prior project note: region = `ge_region` cookie + per-region YAML, not IP geo).
Docs: none dedicated found; task's assumed `bin/i18n/` path doesn't exist (the real root i18n config dir is `config/i18n`, not `bin/i18n`).
External deps: no Crowdin config/rake task was found in this pass (a `crowdin` string hit only inside `dashboard/db/schema_cache.yml`, i.e. a column/table name coincidence, not an actual Crowdin integration) — the localization sync pipeline's mechanism wasn't located in-repo.
Uncertainties: the actual translation-sync pipeline (how strings get out to translators and back) is not visible in this codebase pass — may be entirely external tooling/CI, not found under this search depth.

### Sinatra middleware / legacy routing shims

Purpose: Six small Sinatra apps (`FilesApi`, `ChannelsApi`, `SharedResources`, `NetSimApi`, `AnimationLibraryApi`, `SoundLibraryApi`) implementing legacy, non-RESTful-Rails APIs (channels/projects, shared static assets, net-sim, sound/animation libraries), mounted as ordered Rack middleware ahead of the main Rails app.
Dirs: `dashboard/legacy/middleware/{files_api,channels_api,net_sim_api,sound_library_api,animation_library_api}.rb`, `shared/middleware/shared_resources.rb`, `lib/cdo/sinatra.rb` (tiny `get_or_post` helper extension to `Sinatra::Base`).
Entry points: `dashboard/config/application.rb` — `require_relative '../legacy/middleware/files_api'` etc, then `config.middleware.insert_after Middleware::I18n, FilesApi`, chained `insert_after` calls threading `ChannelsApi → SharedResources → NetSimApi → AnimationLibraryApi → SoundLibraryApi` in that fixed order, all inserted right after Rails' own `Middleware::I18n`/`Middleware::GlobalEdition`.
Docs: none found; the middleware-order concern (Sinatra apps sitting below `ActionDispatch::ShowExceptions`, which can turn a Rails 404/422 into a bare, unreported 500) is documented only in prior project work (memory: `project_prod_5xx_sinatra_middleware_reorder`), not in an in-repo doc.
External deps: none beyond Sinatra itself (`gem 'sinatra'` — presence in Gemfile not directly re-verified this pass, but usage is unambiguous from the `require 'sinatra/base'` lines in every listed file).
Uncertainties: did not re-verify the exact position of `ActionDispatch::ShowExceptions` relative to this middleware chain in this pass (prior project work already root-caused a related production incident, PR #75089 — cite it, don't re-derive).

### pegasus/

Purpose: Pegasus is code.org's other, older Sinatra-based web app (the public code.org marketing/CMS site, as opposed to studio/dashboard), which shares the dashboard database and current-user session (per `docs/pegasus-dashboard-integration.md`: "Pegasus now provides access to the dashboard database and knows which user is signed in"). Owned by another agent — not explored further.

### Third-party integrations

Purpose: Everything the Rails app talks to outside its own DB — AI providers, error/analytics/support vendors, and a handful of school-system integrations.
Dirs/entry points, one anchor each:
- AI/LLM: `dashboard/app/helpers/aichat_*` — one client helper per provider: `aichat_ai_client.rb` (OpenAI, current), `aichat_gemini_client.rb` (Gemini, current), `aichat_sagemaker_helper.rb` (SageMaker), plus `*_legacy.rb` twins for OpenAI/Gemini (`aichat_ai_client_legacy.rb`, `aichat_gemini_client_legacy.rb`) — no Bedrock or Mistral client was found under this naming, contrary to the task's assumption. Langfuse: `dashboard/app/helpers/langfuse_helper.rb`, `langfuse_client_helper.rb`. AI gateway: `dashboard/app/controllers/ai_gateway_auth_controller.rb`.
- javabuilder: `dashboard/app/controllers/javabuilder_sessions_controller.rb` (issues access tokens via `CDO.javabuilder_private_key`).
- Sentry/Honeybadger: Sentry gems (`sentry-rails`, `sentry-ruby`, `sentry-opentelemetry`) are declared in `dashboard/engines/observability/observability.gemspec`, not the main Gemfile; Honeybadger is `gem 'honeybadger'` in `dashboard/Gemfile:207` plus `dashboard/config/honeybadger.yml`. Both appear configured; which is primary wasn't resolved.
- Statsig: `dashboard/config/initializers/statsig.rb` calls `Cdo::StatsigInitializer.init` (backend usage exists, not just frontend as guessed).
- Amplitude: no reference found anywhere under `dashboard/app` or `dashboard/lib` — likely frontend-only (owned elsewhere).
- Clever / Google Classroom: already covered under Auth (`clever_client.rb` initializer, `config.omniauth :clever`) — cite only.
- LTI: already covered under Auth (`dashboard/lib/services/lti.rb`, `policies/lti.rb`, `queries/lti.rb`) — cite only.
- Twilio: `dashboard/app/controllers/sms_controller.rb`; gem `twilio-ruby` (`dashboard/Gemfile:231`).
- Discourse SSO: `dashboard/app/controllers/discourse_sso_controller.rb`, `dashboard/lib/single_sign_on.rb`.
- Zendesk: `dashboard/config/initializers/zendesk.rb` ("configuration for zendesk sso").
- Contentful: `dashboard/engines/cdo_contentful` (already established) — cite only.
- Pardot/CRM: `dashboard/app/models/contact_rollups_pardot_memory.rb`, `dashboard/lib/contact_rollups_v2.rb`, `dashboard/app/models/email_preference.rb`.
- Applitools: no backend Ruby code hit — used only from the UI-test pipeline (see `.drone.yml`'s `ui` pipeline, `VISUAL_PROVIDER: applitools`), not a Gemfile dependency.
Docs: none found beyond `docs/pdf-lesson-plan-generation.md` (AI-adjacent).
Uncertainties: which of Sentry/Honeybadger is authoritative; whether Bedrock/Mistral clients exist under a different name than `aichat_*`; Amplitude may be entirely frontend/owned by another domain.

### Deploy and CI

Purpose: PR/staging CI runs on self-hosted Drone; a large, actively-growing set of GitHub Actions workflows layers on top (frontend packages, k8s image builds, per-package Playwright suites); production deploy is still Chef-provisioned EC2, with a parallel k8s/Kargo pipeline under active build-out (see project memory: draft PRs, not yet the deploy path of record).
Dirs: `.drone.yml` (repo root), `.github/workflows/` (27 files), `bin/` (deploy-adjacent: `bin/deploy-adhoc`, `bin/deploy-config`, `bin/restart-active-job-workers`, `bin/cron/merge_lb_to_staging`, `bin/cron/stop_inactive_adhoc_instances`), `aws/cloudformation/` (31 top-level files), `k8s/`, `docker/`, `cookbooks/` (23 top-level dirs).
Entry points / one line each:
- `.drone.yml` — three pipelines: `unit` (restores a cached staging build, checks out the PR branch merged onto its target, runs `docker/ci/scripts/unit_tests.sh`, triggered on every PR except against `production`/`levelbuilder`); `ui` (same restore/checkout, runs `docker/ci/scripts/ui_tests.sh` with Sauce Labs + Applitools credentials, same PR trigger); `cache-staging-build` (on push to `staging`/`staging-next`, runs `prepare_cacheable_build.sh` and uploads the whole built tree + MySQL data dir to S3 as the shared cache the other two pipelines restore).
- `.github/workflows/` — grouped by purpose: repo/PR hygiene (`assign-dependabot-reviewer.yml` on Dependabot PRs, `pr_check_for_manual_deploy_requirement.yml` on PRs into staging); Docker image builds for the k8s path (`cdo-base-image.yml`, `cdo-deps-image.yml`, `cdo-rails-image.yml` — each keyed off changes to its own `docker/*` subdir or `Gemfile`/`.ruby-version`, plus push to staging); k8s build/deploy plumbing (`k8s.yml`, `k8s-skaffold-build.yml`, `k8s-stitch-multiplatform-image.yml`, `k8s-validate.yml` — reusable `workflow_call` jobs; `k8s.yml`'s own comment: "Deploys come from Kargo, which watches the cdo-rails registry and writes the deployment values files"); per-package test suites, all `workflow_call` reusables pinned to a shared Playwright image tag (`frontend-ci.yml`, `studio-ci.yml`, `component-library-ci.yml`/`component-library-deploy.yml`, `e2e-tests-ci.yml`, `markdown-ci.yml`, `oceans-ci.yml`, `users-ci.yml`, `lesson-deep-dive-ci.yml`); manual/dev-only triggers (`ci_pipeline.yml`, `dev_run_single_test.yml`, `dev_send_email.yml`, `dev_test_docker.yml`, `dtt.yml`, `run_integration_tests.yml`, `run_ui_tests.yml`, `test_pr_notifications.yml`, all `workflow_dispatch`); `frontend-docker-images.yml` (weekly cron + manual, builds/pushes Next.js images).
- `bin/deploy-adhoc` — spins up an "adhoc" (developer preview) instance; `bin/cron/merge_lb_to_staging` — the actual mechanism (flagged as an uncertainty in the Curriculum section above) that merges the `levelbuilder` branch into `staging` on a schedule, gated on a Slack/DTS ("Deploy The Site") permission check via `cdo/chat_client` and `cdo/developers_topic`, and a "new commits" check via `cdo/github` — this is the "robo-commit"/robo-DTS process, confirmed.
- `aws/cloudformation/` — CloudFormation stack templates (`cloud_formation_stack.yml.erb` is the monolithic app stack) plus Lambda-backed custom resources (`ami-manager.js`, `count_asg.js`) — the Chef/EC2-era infra-as-code.
- `k8s/` + `skaffold.yaml` + `docker/` — a from-scratch k8s/skaffold local-dev-and-deploy path (`k8s/README.md`, `k8s/docs/ARCHITECTURE.md`); `docker/README.md` opens with "Warning, this project is still in the early stages." Per project memory this is a real, actively-developed parallel deploy path (Kargo-subscribe model, draft PRs pending sign-off) — **not yet** what production runs on; today's production is Chef.
- `cookbooks/` — Chef Infra cookbooks/recipes ("to provision+configure the `code-dot-org` repository, Ruby applications and various OS components and services to servers"); top-level cookbook is `cdo-apps::default`. Legacy but currently authoritative for prod.
Docs: `k8s/README.md`, `k8s/docs/ARCHITECTURE.md`, `k8s/TODO.md`, `aws/cloudformation/README.md`, `cookbooks/README.md`, `docker/README.md`.
External deps: GitHub (Drone checkout, Actions), AWS (S3 build cache at `s3://cdo-drone`, CloudFormation, Lambda), Sauce Labs + Applitools (UI/Eyes tests), Slack (DTS gating for the levelbuilder merge cron).
Uncertainties: exact current split of prod traffic between Chef/EC2 and k8s wasn't re-verified here (relying on prior project memory, which says k8s is still pre-production); didn't open job bodies inside each `workflow_call` reusable, so per-workflow test scope is one-line/coarse only, as instructed.

