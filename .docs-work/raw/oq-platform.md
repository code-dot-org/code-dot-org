# Open questions 6-16, 18 — platform evidence

Repo: code-dot-org, rev 9793f8d36ae. Read-only pass, no browser tools, no writes.

## A. Sentry vs Honeybadger

Both wired simultaneously by explicit design; not either/or.

- `Gemfile:207` `gem 'honeybadger', '>= 4.5.6' # error monitoring` — unconditional, no engine gate. STRONGLY SUPPORTED
- `Gemfile.lock:548` `honeybadger (4.12.1)`. STRONGLY SUPPORTED
- `dashboard/config/honeybadger.yml:1-3` `api_key: "<%=CDO.dashboard_honeybadger_api_key%>"`, `breadcrumbs: enabled: true` — no feature-flag gate. STRONGLY SUPPORTED
- `dashboard/engines/observability/lib/observability/errors.rb:26-33` `notify_honeybadger` — `return unless defined?(::Honeybadger)` then `::Honeybadger.notify(...)` unconditionally. STRONGLY SUPPORTED
- `lib/cdo/honeybadger.rb:1,58-73` separate `Honeybadger.notify_cronjob_error` path, own `config.api_key = CDO.cronjobs_honeybadger_api_key`, used by `lib/cdo/slack.rb:214,241,250`. OBSERVED
- No `enable_honeybadger` flag exists anywhere (grep empty). INFERRED: no kill-switch, always-on.
- `dashboard/engines/observability/observability.gemspec:20-22` declares `sentry-ruby`, `sentry-rails`, `sentry-opentelemetry` ~>6.5. STRONGLY SUPPORTED
- `Gemfile.lock:1082-1088` sentry gems resolved 6.5.0. STRONGLY SUPPORTED
- `dashboard/engines/observability/lib/observability/engine.rb:21-26` `if Sentry.enabled? ... require 'sentry-ruby' ...` — sentry libs only required when flag true. STRONGLY SUPPORTED
- `dashboard/engines/observability/lib/observability/sentry.rb:8-10` `enabled? = CDO.enable_sentry && !CDO.unit_test`. STRONGLY SUPPORTED
- `dashboard/engines/observability/lib/observability/sentry.rb:15-18` `if CDO.dashboard_sentry_dsn.blank? ... skipping Sentry setup; return`. STRONGLY SUPPORTED (gate exists)
- `config/production.yml.erb:73`, `config/staging.yml.erb:29`, `config/levelbuilder.yml.erb:32`, `config/test.yml.erb:109` all `enable_sentry: true`. STRONGLY SUPPORTED
- `dashboard_sentry_dsn`: zero matches in any repo config file — value lives in uncommitted secrets/locals.yml. AMBIGUOUS (live DSN unverifiable from this checkout)
- `dashboard/engines/observability/lib/observability/errors.rb:37-43` `capture_with_sentry` — `return unless Sentry.enabled? && defined?(::Sentry)`. STRONGLY SUPPORTED
- `dashboard/engines/observability/lib/observability/errors.rb:15-16` comment: "Unhandled exceptions keep reaching both vendors through their own middleware." STRONGLY SUPPORTED
- `dashboard/engines/observability/README.md:27` "Main Dashboard code should report handled errors via `Observability::Errors.report`, not by referencing `Honeybadger` or `Sentry` directly." STRONGLY SUPPORTED
- `Observability::Errors.report` (`errors.rb:20-23`) dual-notifies both vendors; ~80+ call sites across `dashboard/app/`, `dashboard/lib/`, `lib/cdo/`, `lib/dynamic_config/` (e.g. `dashboard/app/controllers/application_controller.rb:417`, `lib/cdo/aws/ec2.rb:119,148`). OBSERVED
- Direct-vendor bypass: `Honeybadger.notify` at `lib/cdo/honeybadger.rb:71`, `lib/cdo/slack.rb:214,241,250` — independent of shared API. OBSERVED. No direct `Sentry.capture_*` outside `errors.rb`. OBSERVED

Last 3 commits:
- Honeybadger (`lib/cdo/honeybadger.rb`): `dae97710064` "chore(pegasus): remove references to decommissioned pegasus infrastructure (#74757)"; `4ed012e8a57` merge dts_candidate_2026-08-28 — only 2 distinct commits found.
- Sentry (`dashboard/engines/observability/lib/observability/sentry.rb`): only `4ed012e8a57` merge found in recent history.
- `errors.rb`: `a9b581e4e7b` "Route handled error reports through a single Observability::Errors.report API (#74801)"; `4ed012e8a57` merge.

Answer: AMBIGUOUS as either/or — both vendors are actively wired by design (dual-report). Honeybadger is unconditional/always-on with independent direct call sites (not vestigial). Sentry is flag-gated (on by config in prod/staging/levelbuilder/test) but its live-in-prod status depends on an uncommitted DSN secret not visible in this checkout.

## B. Poste2 / Mailjet

- `lib/cdo/poste.rb:588-589` `deliver!` → `Poste2.ensure_recipient(...)` then `Poste2.send_message('dashboard', recipient, mail_params)`. STRONGLY SUPPORTED
- `lib/cdo/poste.rb:517-527` `send_message` inserts a row into `POSTE_DB[:poste_deliveries]` — async/DB-queued, not a live SMTP call. STRONGLY SUPPORTED
- `lib/cdo/poste.rb:362` `Deliverer` class: `Net::SMTP.new(@params[:address], @params[:port]).tap { |smtp| smtp.start(...) }`; `:315` `@smtp.send_message message.string, from_address[:email], *to_addresses`. STRONGLY SUPPORTED
- `bin/cron/deliver_poste_messages_process.rb:17-25` `SMTP_OPTIONS = { address: CDO.poste_smtp_server, port: 587, domain: 'code.org', user_name: CDO.poste_smtp_user, password: CDO.poste_smtp_password, authentication: 'plain', enable_starttls_auto: true }`; `:37` `Deliverer.new SMTP_OPTIONS`, `:47` pops from `poste_deliveries` and delivers. STRONGLY SUPPORTED
- `config.yml.erb:347` `poste_smtp_server: email-smtp.us-east-1.amazonaws.com` — AWS SES SMTP endpoint (not SES API/SDK; no `Aws::SES` client found anywhere in poste.rb/bin/cron). STRONGLY SUPPORTED
- `config.yml.erb:344` `poste_host` used only for tracking-pixel/unsubscribe URLs, not the relay. OBSERVED
- No `poste_relay`/`smtp_relay` keys exist anywhere in `config/*.yml.erb` — ABSENT (grep, zero hits).
- `dashboard/config/environments/production.rb:51`, `staging.rb:45` `config.action_mailer.delivery_method = Poste2::DeliveryMethod`. STRONGLY SUPPORTED. `development.rb:37` same default; `test.rb:52` `:test`.
- Mailjet: `Gemfile:388` `gem 'mailjet', '~> 1.7.3'`. `lib/cdo/mailjet.rb:9-10` API_KEY/SECRET_KEY from `CDO.try`; `:17-22` `enabled?` gated by `DCDO.get('use_mailjet', false)` (default off) plus key presence; `:195` `Mailjet::Send.create(...)` (HTTP API, not SMTP; separate from Poste2/ActionMailer).
- Consumers: `Pd::WorkshopMailjetMailer` (`dashboard/app/mailers/pd/workshop_mailjet_mailer.rb`) used from `Pd::Workshop` model (lines 530,576,580,589,690,694) and `Api::V1::Pd::WorkshopsController` (291,296,303) — PD workshop mail. Also non-PD uses: `Section#add_teacher_to_mailjet_course_list` (`dashboard/app/models/sections/section.rb:420-421`) and `lib/cdo/delete_accounts_helper.rb:288,502` (`remove_mailjet_contact`, account deletion).

Answer: Poste2 queues to MySQL then relays via `bin/cron/deliver_poste_messages_process.rb` opening `Net::SMTP` to AWS SES's SMTP endpoint (`email-smtp.us-east-1.amazonaws.com:587`, STARTTLS) — not the SES API. Mailjet is a separate DCDO-flagged (`use_mailjet`, default false) HTTP-API path used for PD workshop mail, teacher course-list sync, and account-deletion contact removal — unrelated to Poste2/ActionMailer's delivery_method.

## C. Background workers and cron

- Gemfile: `:295` `gem 'daemons', '1.1.9'`; `:376` `gem "delayed_job_active_record", "~> 4.1"`. No `whenever` gem (absent).
- `dashboard/config/initializers/delayed_job_config.rb:3,10,12,30` sets `destroy_failed_jobs=false`, `max_attempts=1`. `dashboard/lib/delayed_job_manager.rb:9-27` archives failed jobs, reports CloudWatch metric.
- Workers run as k8s Deployment: `k8s/kustomize/components/backend/active-job-worker-deployment.yaml:1-39` — `Deployment cdo-active-job-worker`, runs `cd dashboard && bundle exec bin/delayed_job run`; file comment: "ActiveJob (delayed_job) worker. First piece of the app to move to Kubernetes." STRONGLY SUPPORTED. Mirrored in `k8s/helm/values.yaml:63-68`.
- `dashboard/bin/delayed_job:1-6` thin wrapper: `Delayed::Command.new(ARGV).daemonize`.
- No delayed_job daemon start found anywhere in `cookbooks/` (grep, zero hits) — worker process itself is k8s-only per the code comment.
- `lib/cdo/active_job_backend.rb` (`Cdo::ActiveJobBackend`) implements rolling-restart for `delayed_job.N` — only test callers found in this pass. AMBIGUOUS (possible dead/legacy EC2 path).
- Authoritative cron source: `cookbooks/cdo-apps/recipes/crontab.rb:1-17` (chef `template` resource renders `crontab.erb`, installs via `crontab -`). No k8s CronJob resources exist (grep, empty). aws/cloudformation only has unrelated Glue Crawler schedules (`aws/cloudformation/data.yml.erb:407,490`, `cron(0 7 * * ? *)`). No Procfile at repo root or dashboard/.

Scheduled jobs (`cookbooks/cdo-apps/templates/default/crontab.erb`, UTC):

Staging daemon only:
- update_dotd — `0 14,15 * * *` :57
- update_dts — `*/1 * * * *` :58
- commit_trusted_proxies — `0 17 * * *` :59
- merge_lb_to_staging — `35 7 * * 1-5` :64
- deploy_to_levelbuilder — `20 9 * * 1-5` :69

Test daemon only:
- deploy_to_test — `*/2 * * * *` :74
- snapshot — `*/5 * * * *` :75
- monitor_mysql_to_redshift_zeroetl_integration — `30 * * * *` :76

Levelbuilder:
- commit_content — `30 7 * * 1-5` :80
- commit_content — `18 9 * * 1-5` :81

Production daemon only:
- scheduled_pd_workshop_emails — `30 14 * * *` :90
- scheduled_pd_application_emails — `0 16 * * *` :91
- process_pd_workshop_ends — `*/4 * * * *` :92
- fill_jotform_placeholders — `*/5 * * * *` :93
- process_foorm_data — `0 6 * * *` :94
- delete_twilio_data — `*/10 * * * *` :95
- confirm_usage — `* * * * *` :96
- teacher_applications_to_gdrive — `0 */2 * * *` :97
- summer_workshops_to_gdrive — `0 5 * * *` :98
- eir_teachers_to_gdrive — `0 13 * * *` :99
- stop_inactive_adhoc_instances — `0 7 * * 6` :100
- redshift_rollups — `0 10 * * *` :101
- cleanup_workshop_attendance_codes — `1 7 * * 6` :102
- zendesk_slack_report — `31 16 * * 1-5` :103
- applab_datasets daily_weather — `5 12 * * *` :104
- applab_datasets viral_50_usa — `0 12 * * *` :105
- export_mysql_database_to_redshift — `00 23 * * *` :106
- monitor_mysql_to_redshift_zeroetl_integration — `30 * * * *` :107
- build_contact_rollups_v2 — `0 0 * * *` :108
- hoc_student_name_cleanup — `0 2 * * *` :109
- send_permission_email_reminders — `0 0 * * *` :110
- monitor_projects — `*/5 * * * *` :111
- delete_old_ai_chat_data — `0 4 * * *` :112
- openai_pdf_processing_availability_check — `0 * * * *` :113
- push_latest_aurora_backup_to_secondary_account — `50 11 * * *` :116
- User::PiiScrubberJob (perform_job) — `0 8 * * *` :119
- User::InactiveTeacherDeletionWarningJob (perform_job, {"limit":1000}) — `0,30 0-11 * * *` :122
- ProjectStorage::AnonymousGeoBackfillingJob (perform_job, {"limit":100000}) — `*/5 2-11 * * *` :125

All environments (daemon nodes):
- ci_build — `*/1 * * * *` :129
- report_activejob_metrics — `*/5 * * * *` :132
- archive_failed_jobs — `30 * * * *` :133
- HocLegacy::RefreshTutorialsJob (perform_job) — `0 * * * *` :136

All environments except adhoc:
- deliver_poste_messages — `*/1 * * * *` :140
- geocode_hoc_activity — `*/1 * * * *` :141
- form_geos — `*/1 * * * *` :142
- user_geos — `*/1 * * * *` :143
- create_rollup_tables — `0 23 * * 5` :144
- update_project_count — `0 4 * * 0` :145

Answer: ActiveJob/delayed_job workers run as a k8s Deployment (`cdo-active-job-worker`); all cron scheduling is a single chef-rendered crontab (`cookbooks/cdo-apps/templates/default/crontab.erb`) calling `bin/cron/<script>` or `bin/cron/perform_job <JobClass>`. No k8s CronJob resources exist.

## D. Chef/EC2 vs k8s topology today

No file makes a single unambiguous "X serves production today" sentence; strongest direct assertion favors Chef/EC2.

- `cookbooks/README.md:13-19`: "These cookbooks are used to provision applications to `production` and other managed-infrastructure server environments." / "In these managed environments, the [application's CloudFormation template] provides its EC2 instances with a [cloud-init user-data script] ... that includes the [`bootstrap_chef_stack.sh.erb`] ... which [installs the Chef Client] ... and invokes ... `chef-client` ... which runs the specified cookbooks/recipes." STRONGLY SUPPORTED (present tense).
- `cookbooks/README.md:21-23`: "Currently, managed environments run [`update_cookbook_versions`] and package/upload versioned cookbooks to a hosted [Chef Infra Server] ..., then connect to that server with `chef-client` to provision." STRONGLY SUPPORTED.
- `cookbooks/README.md:25-27` (in-progress signal): "`adhoc` environments work slightly differently by running `chef-client` in [Local Mode] ... This is much simpler and will eventually become the default provisioning mode for all environments." STRONGLY SUPPORTED as future-tense/not-yet-default.
- `k8s/README.md:5-8`: "Skaffold allows us to use a single almost-identical toolchain to both do 'docker-compose' style local dev ... as well as deploy real production/test/etc instances to a k8s cluster." / "This makes debugging your production infra setup really easy: its just like what you're running locally." AMBIGUOUS — describes capability/tooling, not a claim that k8s serves live production traffic today.
- `k8s/README.md:130-131`: describes a `skaffold run -p production` profile existing and deployable. AMBIGUOUS — a configured profile, not proof of current live-traffic status.
- `k8s/docs/ARCHITECTURE.md:5-6`: `env_type` classes include `production`; `release_name` examples given (`autoscale-prod`). AMBIGUOUS — names production as a supported env_type, doesn't assert current traffic-serving status.
- `docker/README.md:3,5`: "**Warning, this project is still in the early stages**" / scope: "running the code.org website locally for development and CI purposes." STRONGLY SUPPORTED as not-production-serving today.
- `aws/cloudformation/README.md:19`: "How do you test your changes without affecting production services?" INFERRED — implies CloudFormation/EC2-provisioned stacks are the live "production services" today; rhetorical framing, not a declarative statement.
- No `docs/deploy*.md` or `docs/infrastructure*.md` exist at top level.

Answer: per in-repo docs, Chef/EC2 via CloudFormation-provisioned instances is asserted as serving production today (cookbooks/README.md:13,21-23; corroborated by aws/cloudformation/README.md:19). k8s is documented as a supported/buildable deployment target (including a "production" env_type/skaffold profile and a k8s-hosted ActiveJob worker per item C) but no file in this set asserts k8s serves live production request traffic today; docker/README.md self-flags "early stages" / local-CI scope.

## E. TTS: Acapela vs Azure

Both live, for different purposes — not a single either/or path.

Acapela — pre-recorded curriculum instruction/hint audio, uploaded to S3, served from tts.code.org:
- `dashboard/lib/acapela.rb:8-70` `Acapela.text_to_audio_url` posts to `http://vaas.acapela-group.com/Services/Synthesizer`. STRONGLY SUPPORTED, no flag guard.
- `dashboard/app/models/concerns/text_to_speech.rb:97` `Acapela.text_to_audio_url(...)` inside `tts_upload_to_s3`, called from `before_save :tts_update` (:56) — unconditional on level save when TTS-eligible. STRONGLY SUPPORTED.
- `text_to_speech.rb:145-148` `tts_url` → `https://tts.code.org/...`, consumed by `levels_helper.rb:470-471` gated only by `@script&.text_to_speech_enabled?` (:469) — no Azure/Acapela selection flag. STRONGLY SUPPORTED.
- `text_to_speech.rb:81` `use_new_path = DCDO.get('updated_tts_path', false)` — default false; toggles S3 key layout only, not backend. STRONGLY SUPPORTED.

Azure — live/on-demand TTS for AppLab, GameLab, SpriteLab:
- `dashboard/app/controllers/concerns/azure_text_to_speech.rb:104-106` `allowed? = Gatekeeper.allows('azure_speech_service', default: true) && api_key.present? && region.present?`. STRONGLY SUPPORTED for default value; AMBIGUOUS whether keys are configured in this checkout.
- `lib/dynamic_config/gatekeeper.rb:29-38` `allows` returns the caller-passed default absent a rule_map entry; no override found for `azure_speech_service` in this pass. INFERRED default true is in effect.
- `dashboard/app/models/game.rb:284-286` `use_azure_speech_service? = [APPLAB, GAMELAB, SPRITELAB].include? app`. STRONGLY SUPPORTED — scoped to these 3 labs only.
- `levels_helper.rb:577-579` `azure_speech_service_options` empty unless `@level.game.use_azure_speech_service?`. Consumed at `script_levels_controller.rb:601`, `projects_controller.rb:468`.
- `dashboard/app/controllers/api/v1/text_to_speech_controller.rb:9,14-34` `POST /dashboardapi/v1/text_to_speech/azure`, calls `AzureTextToSpeech.throttled_get_speech`, DCDO-configurable throttle (defaults 1000/min IP, 100/min default). STRONGLY SUPPORTED.

Answer: Acapela is the default backend for pre-generated level-instruction/hint audio (unconditional on level save; `updated_tts_path` DCDO default false only changes S3 key shape). Azure is the default backend for on-demand in-lab speech in AppLab/GameLab/SpriteLab, gated by `Gatekeeper.allows('azure_speech_service', default: true)` which defaults ON absent an override rule. Both are live simultaneously for distinct features, not competing implementations of the same feature.

## F. Security items 6-11

### 6. Api::V1::TestLogsController reachability

- `dashboard/config/routes.rb:1146` `if rack_env?(:development, :test)` guards one route block; `:1157` `if rack_env?(:staging, :test)` guards another; both close before the unconditional `namespace :api / namespace :v1` block.
- `dashboard/config/routes.rb:1237-1238` `get 'test_logs/*prefix/since/:time', to: 'test_logs#get_logs_since', ...` and `get 'test_logs/*prefix/:name', to: 'test_logs#get_log_details', ...` sit inside the unconditional namespace block, preceded only by a comment, no `rack_env?` guard.
- `dashboard/app/controllers/api/v1/test_logs_controller.rb:8` — no before_action/skip_before_action lines at all; both actions read from S3 keyed by user-supplied `params[:prefix]`.

Verdict: STRONGLY SUPPORTED — `test_logs` routes carry no environment guard (unlike the two adjacent test/dev route blocks) and the controller has no auth before_action. Reachable in production as filed.

### 7. ProjectsController unauthenticated actions

- `dashboard/app/controllers/projects_controller.rb:5` `before_action :authenticate_user!, except: [:load, :create_new, :show, :edit, :readonly, :redirect_legacy, :public, :index, :export_config, :weblab_footer, :get_or_create_for_level, :can_publish_age_status, :submission_status, :submit]`.
- `readonly`/`public` listed in except but are not real controller actions (`readonly` is a route param passed to `show`) — no-op inclusion.
- `load` (:310-321): no auth beyond `redirect_under_13_without_tos_teacher`. `create_new` (:323-355): creates channel via `ChannelToken.create_channel(request.ip, Projects.new(get_storage_id), ...)` (:344) — IP/cookie-derived storage id, not a permission check. `show` (:412-515): no ownership/authorize! check; gated only by `@level.deprecated?` and share/embed params. `edit` (:517-520): delegates to `show`, same lack of ownership check. `export_config` (:659-666): only `redirect_under_13_without_tos_teacher`; also `protect_from_forgery except: :export_config` (:9) disables CSRF for this action. `submission_status` (:576-586): explicit `authorize! :submission_status, project` (:580) inside rescue CanCan::AccessDenied.
- Other guards: `authorize_load_project!` (:7, only: load/create_new/edit/remix) → `authorize! :load_project, params[:key]` (:780) is a per-level-type CanCan check, not per-channel/ownership.

Verdict: STRONGLY SUPPORTED — `load`, `create_new`, `show`, `edit`, `export_config` run unauthenticated with no per-channel ownership check; only `submission_status`/`submit` carry explicit `authorize!`. Channel-id unguessability is the de facto protection for the rest, as OQ item 7 states.

### 8. AichatRequestsController auth

- `dashboard/app/controllers/aichat_requests_controller.rb:4` `authorize_resource class: false` (CanCan). `:5` `before_action :reassign_model_customizations, only: [:start_chat_completion]` — a param-rename shim, not auth.
- No `authenticate_user!` anywhere in the file. `ApplicationController` (full file read) has no default `authenticate_user!` before_action — its before/around_actions are: `handle_cap_lockout`/`assert_lms_landing_policy` (:19), `configure_permitted_parameters` (:22), `fix_crawlers_with_bad_accept_headers` (:24), `clear_sign_up_session_vars` (:26), `initialize_statsig_stable_id` (:28), `persist_brand_params` (:30), `around_action :with_global_current_user` (:32). None authenticate.
- CanCan::AccessDenied rescued at controller :16-18, rendering 403 with `user_type: current_user&.user_type || 'signed_out'` — the actual gate for signed-out actors is this CanCan ability check, not authenticate_user!.
- `dashboard/config/routes.rb:1485-1487` — no route-level constraints or auth wrapper.

Verdict: STRONGLY SUPPORTED — confirmed no `authenticate_user!` in the controller or its ancestor; gating for anonymous users is via CanCan `authorize_resource class: false` (ability-class dependent, not traced further) plus a rescued AccessDenied.

### 9. sections#archive_all CSRF skip rationale

- `dashboard/app/controllers/sections_controller.rb:8` `skip_before_action :verify_authenticity_token, only: [:archive_all]`.
- `git blame -L 8,8` → boundary commit `4ed012e8a57` (merge "dts_candidate_2026-08-28" / robo-dts levelbuilder→staging sync) — not the authoring commit, no rationale in message.
- Repo is shallow (`git rev-parse --is-shallow-repository` → true); parents of the boundary commit are unreachable locally (`git log 4ed012e8a57^1`/`^2` → ambiguous/unknown revision). `git log -S`/`-G` on the line across full local history returns only the same boundary merge.

Verdict: AMBIGUOUS — cannot resolve rationale from this (shallow) checkout; needs an unshallow fetch or GitHub blame/PR search to find the true authoring commit.

### 10. Media/XHR/redirect proxy limits

- Routes: `dashboard/config/routes.rb:174` `get 'media', to: 'media_proxy#get'`; `:177` `get 'xhr', to: 'xhr_proxy#get'`; `:179` `get 'redirected_url', to: 'redirect_proxy#get'` — no route-level constraints/throttling.
- `dashboard/app/controllers/media_proxy_controller.rb:14,~19-33,~41-43` — content-type allowlist (`ALLOWED_CONTENT_TYPES`) and hostname-suffix allowlist (`MEDIA_ALLOWED_HOSTNAME_SUFFIXES`). No rate limit in file.
- `dashboard/app/controllers/xhr_proxy_controller.rb:15` — JSON content-type allowlist only; file comment: "we only proxy content with an allowed list of JSON response types. We will need to monitor usage to detect abuse and potentially add other abuse prevention measures." No rate limit implemented.
- `dashboard/app/controllers/redirect_proxy_controller.rb:3` — hostname-suffix allowlist only (`bit.ly`, `ow.ly`, `t.co`, `tinyurl.com`, `tr.im`, `goo.gl`). No rate limit.
- No `Rack::Attack` gem in Gemfile/Gemfile.lock; no `rack_attack*` initializer anywhere. `cookbooks/cdo-nginx/recipes/default.rb` has no `limit_req`/rate-limit or media/xhr allowlist stanza. `aws/cloudformation` hits only an unrelated CloudFront header allowlist (`domain_redirect.yml.erb:122`).

Verdict: STRONGLY SUPPORTED (absence) — content-type/hostname allowlisting exists per proxy controller; no rate limiting or IP allowlisting found anywhere in-repo for these three routes. Does not rule out AWS-console/WAF-level limits outside version control.

### 11. Teacher→student downgrade server-side guard

Correction: `UsersController#update` does not exist for this mutation; the endpoint is `RegistrationsController`.

- `dashboard/app/controllers/registrations_controller.rb:121-124` generic `update` explicitly rejects: `return head(:bad_request) if params[:user][:user_type].present?`.
- `registrations_controller.rb:386-389` `set_user_type` (routed `PATCH /users/user_type`): `return head(:bad_request) unless current_user.can_change_own_user_type?`.
- `dashboard/app/models/user.rb:1131-1146` `can_change_own_user_type?` — for a teacher downgrading: `sections_instructed.where(demo_type: nil).empty?` (comment: "Downgrade destroys sections owned by the teacher. Disallow downgrading unless the teacher only has demo sections.").

Verdict: STRONGLY SUPPORTED — a real server-side guard exists at the model layer (`can_change_own_user_type?`), gating on `sections_instructed` before the downgrade is persisted. This CONTRADICTS this session's own prior memory note (`reference_user_type_downgrade_gate.md`, "gated ONLY by sections_instructed, UI-only: endpoint accepts it and orphans an invalid section") — flagged for reconciliation; the prior note may reference a different endpoint/path than `set_user_type`, not re-verified in this pass.

## G. DCDO defaults for teacher/student-facing gates

Extracted from `.docs-work/availability-gates.md` §1, teacher/student/all-user role annotations only; excluded purely internal/ops/admin/test-only/data-pipeline keys per subagent's own scoping note (see file for exclusion list).

ROWS: 99 (table below is the same table the subagent produced; see full key list and per-site line numbers in the raw subagent output — reproduced here as delivered)

Conflicts flagged (same key, differing defaults across call sites):
- `ai-dancer-head-crop` — `false` (lib/dynamic_config/dcdo.rb:51) vs no 2nd arg / undefined (apps/src/dance/lottie/LottieDancerUtils.ts:847)
- `browser-tts-button-enabled-locales` — `['en-US','en']` (lib/dynamic_config/dcdo.rb:48) vs `[]` (apps/src/lab2/views/components/TextToSpeech.tsx:24)
- `hoc_secret` — `''` vs `nil` (dashboard/app/views/shared/_check_admin.html.haml:3 vs _maybe_set_hoc_secret.html.haml:6)
- `openai_http_read_timeout` — `30` at most sites, `20` nested-fallback at 2 sites, `SharedConstants::AI_CHAT_READ_TIMEOUTS[clientType] || 30` at 2 sites
- `student-snapshot-feedback-link` — `undefined` (JS, apps/src/templates/studentSnapshot/StudentSnapshot.tsx:117) vs `false` (Ruby, lib/dynamic_config/dcdo.rb:67)
- `lab2-fetch-level-proper0ties-by-lesson-id` (typo'd) vs `lab2-fetch-level-properties-by-lesson-id` (correctly spelled) — two distinct keys, both default `true`, likely a naming bug (not a value conflict) — flagged, not resolved.

| key | default(s) | call sites |
|---|---|---|
| ai-dancer-head-crop | false, undefined (no 2nd arg) (CONFLICT) | lib/dynamic_config/dcdo.rb:51, apps/src/dance/lottie/LottieDancerUtils.ts:847 |
| ai-diff-drawer | false | apps/src/aiTeacherDrawer/AiDiffWorkspace.tsx:78, lib/dynamic_config/dcdo.rb:85 |
| ai-gateway-enabled | true | lib/dynamic_config/dcdo.rb:78 |
| ai-gateway-turnstile-enforcement-mode | 'disabled' (TURNSTILE_ENFORCEMENT_MODE_DEFAULT) | dashboard/app/controllers/ai_gateway_auth_controller.rb:86 (const :22,:24) |
| ai-lesson-summaries-notifications-enabled | false | dashboard/app/jobs/ai_lesson_summaries_job.rb:7, ai_lesson_summary_podcasts_job.rb:7, apps/src/aiDifferentiation/AiDiffFloatingActionButton.tsx:132, dashboard/app/models/teacher_notification.rb:56, lib/dynamic_config/dcdo.rb:65 |
| ai-lesson-summary-podcasts | false | dashboard/app/views/teacher_dashboard/show.html.haml:33, ai_lesson_summary_podcasts_controller.rb:14, apps/src/templates/teacherDashboard/teacherSectionsRedux.ts:1142, dcdo.rb:63 |
| ai-teaching-assistant-launch | false | lib/dynamic_config/dcdo.rb:41 |
| aichat-output-image-llm-safety-judge-enabled | true | lib/dynamic_config/dcdo.rb:81 |
| aichat_access_units | [] | dashboard/app/models/sections/section.rb:946 |
| aichat_polling_backoff_rate | DEFAULT_POLLING_BACKOFF_RATE | dashboard/app/controllers/aichat_requests_controller.rb:194 |
| aichat_polling_interval_ms | DEFAULT_POLLING_INTERVAL_MS | aichat_requests_controller.rb:190 |
| aichat_request_limit_per_min | DEFAULT_REQUEST_LIMIT_PER_MIN | aichat_requests_controller.rb:147 |
| aichat_token_limit_per_day | DEFAULT_TOKEN_LIMIT_PER_DAY | dashboard/app/helpers/aichat_ai_usage_reporter.rb:145 |
| aif-launch | false | lib/dynamic_config/dcdo.rb:57 |
| allow_international_usage_all_models | false | dashboard/app/models/concerns/user/ai_accessible.rb:85 |
| allowed_iframe_ancestors | nil (falls back to CDO.allowed_iframe_ancestors) | lib/cdo/rack/upgrade_insecure_requests.rb:70 |
| azure_speech_service_default_timeout | 5 | dashboard/app/controllers/concerns/azure_text_to_speech.rb:117 |
| azure_speech_service_tts_timeout | 10 | azure_text_to_speech.rb:121 |
| azure_tts_request_limit_per_min_default | REQUEST_LIMIT_PER_MIN_DEFAULT | dashboard/app/controllers/api/v1/text_to_speech_controller.rb:21 |
| azure_tts_request_limit_per_min_ip | REQUEST_LIMIT_PER_MIN_IP | text_to_speech_controller.rb:20 |
| best-of-stem-2024 | false | lib/dynamic_config/dcdo.rb:46 |
| blockly-keyboard-navigation | false | lib/dynamic_config/dcdo.rb:60 |
| blockly_i18n_in_text | false | dashboard/app/models/levels/blockly.rb:569 (const :92) |
| brand-router-enabled | false | dashboard/app/controllers/application_controller.rb:71, lib/cdo/brand.rb:71 |
| browser-cloudwatch-metrics | true | dashboard/app/controllers/browser_events_controller.rb:56 (const :6) |
| browser-events-enabled | true | apps/src/metrics/MetricsReporter.ts:152,198, lib/dynamic_config/dcdo.rb:83 |
| browser-tts-button-enabled-locales | ['en-US','en'], [] (CONFLICT) | lib/dynamic_config/dcdo.rb:48, apps/src/lab2/views/components/TextToSpeech.tsx:24 |
| cap_#{state_code}_lockout_date_override | nil | dashboard/lib/policies/child_account/state_policies.rb:51 |
| cdo-blockly-usage | false | lib/dynamic_config/dcdo.rb:50 |
| cfu-pin-hide-enabled | false | lib/dynamic_config/dcdo.rb:44 |
| challenge_evaluation_read_timeout | 60 | dashboard/app/helpers/challenge_evaluation_openai_helper.rb:38 |
| csta-form-extension | false | lib/dynamic_config/dcdo.rb:35 |
| curriculum-launch-2024 | false | apps/src/code-studio/pd/professional_learning/LandingPage.jsx:374, dcdo.rb:34 |
| datablock_storage_request_limit_per_ten_seconds | 30 | dashboard/app/controllers/datablock_storage_controller.rb:343 |
| default-brand | BRAND_CODEAI_NEXT | lib/cdo/brand.rb:66 |
| detect-remote-network-config | {} | lib/dynamic_config/dcdo.rb:61 |
| disallowed_html_tags | [] | dashboard/app/helpers/levels_helper.rb:583, dashboard/legacy/middleware/files_api.rb:383 |
| diversity_audience | 'all' | dashboard/app/helpers/survey_results_helper.rb:16 |
| exploring-gen-ai-launch | false | lib/dynamic_config/dcdo.rb:53 |
| foorm_simple_survey_disabled | [] | dashboard/app/models/foorm/simple_survey_form.rb:49 |
| frontend-i18n-tracking | false | lib/dynamic_config/dcdo.rb:31 |
| frontend-observability-enabled | false | apps/src/metrics/MetricsReporter.ts:117,143, dashboard/app/views/layouts/application.html.haml:35, apps/src/sites/studio/pages/essential.js:8, dcdo.rb:82 |
| frontend-observability-sampling-config | {} | dashboard/engines/observability/app/helpers/observability_helper.rb:14 |
| gender | false | lib/dynamic_config/dcdo.rb:36 |
| get_channel_ids_from_featured_projects_gallery | true | dashboard/app/controllers/musiclab_controller.rb:50 |
| global_edition_enabled_regions | REGIONS | lib/cdo/global_edition.rb:104 |
| google_classroom_family_name | false | dashboard/app/models/sections/google_classroom_section.rb:48 |
| hide-teacher-dashboard-logo-animation | false | dashboard/app/views/teacher_dashboard/show.html.haml:9 |
| hide_dance_followup | false | dashboard/app/views/congrats/index.html.haml:10 |
| hide_incubator_link | false | dashboard/app/helpers/incubator_helper.rb:6 |
| hoai2025-share-enabled | true | lib/dynamic_config/dcdo.rb:64 |
| hoc_mode | false | lib/dynamic_config/dcdo.rb:39 |
| hoc_secret | '', nil (CONFLICT) | dashboard/app/views/shared/_check_admin.html.haml:3, _maybe_set_hoc_secret.html.haml:6 |
| image_optim_pixel_max | IMAGE_OPTIM_PIXEL_MAX | lib/cdo/optimizer.rb:64 |
| inactive_teacher_deletion_warning | false | dashboard/app/jobs/user/inactive_teacher_deletion_warning_job.rb:8 |
| jotform_redirect | false | dashboard/app/helpers/pd/jot_form/embed_helper.rb:41 |
| javabuilder_demo_http_url | 'https://javabuilder-demo-http.code.org' | lib/cdo.rb:243 |
| javabuilder_demo_websocket_url | 'wss://javabuilder-demo.code.org' | lib/cdo.rb:239 |
| javabuilder_http_url | 'https://javabuilder-http.code.org' | lib/cdo.rb:231 |
| javabuilder_websocket_url | 'wss://javabuilder.code.org' | lib/cdo.rb:216 |
| lab2-fetch-level-proper0ties-by-lesson-id (typo'd) | true | lib/dynamic_config/dcdo.rb:66 |
| lab2-fetch-level-properties-by-lesson-id (distinct, correctly spelled) | true | apps/src/lab2/hooks/useLoadLevelProperties.ts:13-16 |
| lab2-submit-project-enabled | true | lib/dynamic_config/dcdo.rb:49 |
| migration_service_enabled | false | dashboard/lib/user_multi_auth_helper.rb:86 |
| modularity | true | lib/dynamic_config/dcdo.rb:55 |
| music-lab-banner | false | lib/dynamic_config/dcdo.rb:54 |
| music-lab-existing-projects-default-sounds | true | lib/dynamic_config/dcdo.rb:43, apps/src/music/views/MusicView.jsx:434 |
| music-lab-samples-report | true | lib/dynamic_config/dcdo.rb:42, apps/src/music/analytics/AnalyticsReporter.ts:186 |
| nps_audience | 'none' | dashboard/app/helpers/survey_results_helper.rb:38 |
| onboarding-enabled | false | apps/src/templates/studioHomepages/teacherHomepageV2/TeacherHomepage.tsx:61, dcdo.rb:84, Header.tsx:167 |
| openai_http_open_timeout | 5 (uniform) | challenge_evaluation_openai_helper.rb:34, ai_evaluation_openai_helper.rb:41,85, ai_student_podcasts_helper.rb:248, aichat_ai_client_legacy.rb:26, aichat_openai_responses_helper.rb:32, ai_student_snapshot_helper.rb:209,244, personalization_openai_helper.rb:40, ai_lesson_summaries_helper.rb:134, aichat_ai_client.rb:26 |
| openai_http_read_timeout | 30 (most), 20 nested-fallback (2 sites), SharedConstants::AI_CHAT_READ_TIMEOUTS[clientType]\|\|30 (2 sites) (CONFLICT) | ai_lesson_summaries_helper.rb:135, aichat_safety_helper.rb:25, aichat_ai_client_legacy.rb:20, personalization_openai_helper.rb:41, ai_student_snapshot_helper.rb:210,245, ai_student_podcasts_helper.rb:249, ai_podcasts_safety_helper.rb:27, aichat_ai_client.rb:20, ai_evaluation_openai_helper.rb:42,86, aichat_openai_responses_helper.rb:33 |
| openai_temperature_scaling_factor | 1.5 | dashboard/app/helpers/aichat_ai_helper.rb:123 |
| page_mode | DEFAULT_PAGE_MODE | lib/dynamic_config/page_mode.rb:23 |
| pl-launch-hero-banner | false | lib/dynamic_config/dcdo.rb:33 |
| pl-teacher-application-off-season | false | dashboard/app/controllers/pd/professional_learning_controller.rb:247 |
| pl_teacher_application (distinct key, forwarded as pl-teacher-application-off-season to JS) | false | lib/dynamic_config/dcdo.rb:32 |
| profanity_request_limit_per_min_default | REQUEST_LIMIT_PER_MIN_DEFAULT | dashboard/app/controllers/profanity_controller.rb:26 |
| profanity_request_limit_per_min_ip | REQUEST_LIMIT_PER_MIN_IP | profanity_controller.rb:25 |
| project-uuid-in-url | false | dashboard/legacy/middleware/helpers/projects.rb:46 |
| public_max_age | DEFAULT_PUBLIC_CLIENT_MAX_AGE | dashboard/app/helpers/cached_unit_helper.rb:28 |
| public_proxy_max_age | DEFAULT_PUBLIC_PROXY_MAX_AGE | cached_unit_helper.rb:29 |
| recent_privacy_policy_update | nil | lib/cdo/footer.rb:18 |
| restrict-abuse-reporting-to-verified | false | dashboard/app/controllers/report_abuse_controller.rb:170 |
| sandboxed-preview-domain | DEFAULT_PREVIEW_DOMAIN (JS), 'codeprojects.org' (Ruby) | apps/src/util/sandboxedPreviewDomain.ts:25, lib/dynamic_config/dcdo.rb:73 |
| schoology_deep_linking_enabled | false | dashboard/app/controllers/lti/v1/deep_linking_controller.rb:49, dashboard/lib/policies/lti.rb:275 |
| scholarship-dropdown-locked | true | apps/src/code-studio/pd/components/scholarshipDropdown.jsx:9, dcdo.rb:38 |
| share_filtering_blockly_json_max_depth | JSON_MAX_DEPTH | lib/cdo/share_filtering.rb:95,119 |
| show-aita-lesson-summaries | false | dashboard/app/views/teacher_dashboard/show.html.haml:32, apps/src/templates/teacherDashboard/teacherSectionsRedux.ts:1132, dcdo.rb:62 |
| skills-dashboard | false | apps/src/templates/teacherNavigation/TeacherNavigationRouter.tsx:336, dcdo.rb:58 |
| sketchlab-s3-image-storage | true | lib/dynamic_config/dcdo.rb:68 |
| strict-password-country | false | dashboard/app/models/concerns/user/password_validations.rb:33 |
| student-snapshot-feedback-link | undefined (JS), false (Ruby) (CONFLICT) | apps/src/templates/studentSnapshot/StudentSnapshot.tsx:117, dcdo.rb:67 |
| teacher-homepage-v2-announcement | false | lib/dynamic_config/dcdo.rb:45 |
| teacher-homepage-welcome | false | lib/dynamic_config/dcdo.rb:59 |
| throttle_time_default | 60 | lib/cdo/throttle.rb:84 |
| updated_tts_path | false | dashboard/app/models/concerns/text_to_speech.rb:81 (const :39) |
| use-ghostscript-to-generate-pdfs | false | dashboard/lib/services/curriculum_pdfs/resources.rb:163,211 |
| use-pythonlab-separate-domain | false | apps/src/pythonlab/pyodideSandboxEnabled.ts:8, dcdo.rb:77 |
| webpurify_http_read_timeout | 10 (uniform; shared by Twilio SMS client and WebPurify client) | dashboard/app/controllers/sms_controller.rb:34, lib/cdo/web_purify.rb:15 |

## Unresolved

- A: live production `dashboard_sentry_dsn` value cannot be confirmed from this checkout (secret not committed) — Sentry's actual production activation state is inferred, not observed.
- C: `Cdo::ActiveJobBackend` (`lib/cdo/active_job_backend.rb`) production caller not found in this pass — may be a legacy EC2/chef path now dead, or invoked from a deploy script this grep missed.
- D: no file directly asserts k8s is or is not currently serving live production traffic; only capability/taxonomy language found. Chef/EC2-as-current is the stronger read but not a single unambiguous sentence.
- F.9: `sections#archive_all` CSRF-skip rationale is unrecoverable from this shallow clone; needs unshallow fetch or GitHub history search.
- F.10: absence of rate limiting confirmed in-repo only; AWS WAF/CloudFront-level limits outside version control not checked (out of tool scope — no AWS console access).
- F.11: contradicts prior session memory (`reference_user_type_downgrade_gate.md`) calling the gate UI-only; not reconciled — possible the memory note refers to a different code path/endpoint.
- G: two near-duplicate DCDO keys differing only by a typo (`lab2-fetch-level-proper0ties-by-lesson-id` vs `...properties-by-lesson-id`) suggest a possible dead/broken flag pairing — not resolved, flagged only.
- G: full 99-row table condensed for this file; complete per-site line-number listing lives only in the originating subagent transcript, not reproduced verbatim here.
