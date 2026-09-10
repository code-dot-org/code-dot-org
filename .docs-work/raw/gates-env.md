## 4. Environment / config gates

`ENV_PREFIX = rack_env?(:adhoc) ? CDO.stack_name : rack_env` | dashboard/app/controllers/browser_events_controller.rb:8 | gates: Cloudwatch log group/stream/metric namespace naming (not access) | reachable in: all envs (naming only; adhoc uses stack name instead of "adhoc")
`if rack_env?(:development)` | dashboard/app/controllers/codeprojects_preview_controller.rb:43 | gates: CSP allows webpack-dev-server port 9000 websocket/connect-src for project preview iframe | reachable in: development only
`unless rack_env?(:development) || rack_env?(:test)` | dashboard/app/controllers/codeprojects_preview_controller.rb:118 | gates: adds `upgrade-insecure-requests` CSP directive (HTTPS enforcement for student project preview) | reachable in: staging/adhoc/production (skipped in development/test)
`return head :forbidden if rack_env?(:development, :production)` | dashboard/app/controllers/dev_controller.rb:21 | gates: `start_build` action (Slack-triggered build restart) | reachable in: staging, test, adhoc, levelbuilder (forbidden in development and production)
`return head :forbidden unless rack_env?(:staging)` | dashboard/app/controllers/dev_controller.rb:42 | gates: `check_dts` action (GitHub webhook handler for DTS candidate builds) | reachable in: staging only
`return head :not_found unless DCDO.get('frontend_studio_enabled', !Rails.env.production?)` | dashboard/app/controllers/frontend_studio_controller.rb:4 | gates: entire Frontend Studio app route; DCDO flag defaults to on everywhere except production | reachable in: all non-production by default, production too once flag flipped true
`return render_404 if Rails.env.production?` | dashboard/app/controllers/foorm_preview_controller.rb:4 | gates: `index` action, Foorm form-list preview page | reachable in: development/test/staging/adhoc/levelbuilder (blocked in production)
`return render_404 if Rails.env.production?` | dashboard/app/controllers/foorm_preview_controller.rb:24 | gates: `name` action, single Foorm form preview page | reachable in: development/test/staging/adhoc/levelbuilder (blocked in production)
`can_access_dashboard_assets = !rack_env?(:development)` | dashboard/app/controllers/javabuilder_sessions_controller.rb:101 | gates: JWT payload flag controlling whether the Javabuilder session may reach dashboard-hosted assets | reachable in: all envs (value differs; false only in development)
`if (Rails.application.config.levelbuilder_mode || rack_env?(:test)) && !is_standalone_project` | dashboard/app/controllers/levels_controller.rb:598 | gates: rendering the "[E]dit" level link on level pages | reachable in: levelbuilder-mode servers (any env with that config flag) plus test
`client = if (...stub_aichat_external_services) || [:development, :test].include?(rack_env)` | dashboard/app/controllers/aidiff_threads_controller.rb:147 | gates: whether Amazon Comprehend PII check uses a stubbed client vs the real AWS client | reachable in: real client in staging/adhoc/levelbuilder/production; stub in development/test (or when config flag set)
`closed = Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')` | dashboard/app/controllers/pd/professional_learning_controller.rb:136 | gates: whether the PD teacher-application form reports itself closed | reachable in: only computed true in production (non-production always reports open)
`app_name: Rails.env.production? ? brand_name : "#{brand_name} [#{Rails.env}]"` | dashboard/app/controllers/projects_controller.rb:467 | gates: display-only app name suffix (shows env name) on shared project page | reachable in: all envs (cosmetic)
`unless Rails.env.development? || Rails.env.test?` | dashboard/app/controllers/projects_controller.rb:815 | gates: sending the "Featured project gallery submission" email via Zendesk HTTParty POST | reachable in: staging/adhoc/levelbuilder/production (skipped in development/test)
`unless Rails.env.test? || Rails.env.development?` | dashboard/app/controllers/api/v1/projects/public_gallery_controller.rb:4 | gates: `expires_in 5.seconds, public: true` HTTP caching on the public project gallery API | reachable in: caching applied in staging/adhoc/levelbuilder/production; skipped in test/development
`if rack_env?(:development)` | dashboard/app/controllers/pyodide_sandbox_controller.rb:15 | gates: CSP allows webpack-dev-server port 9000 for the Pyodide sandbox iframe | reachable in: development only
`if rack_env?(:development) || rack_env?(:test)` | dashboard/app/controllers/pyodide_sandbox_controller.rb:30 | gates: adds `'unsafe-eval'` to script-src CSP (needed for non-production webpack `eval()` source maps) | reachable in: development and test only
`unless rack_env?(:development) || rack_env?(:test)` | dashboard/app/controllers/pyodide_sandbox_controller.rb:56 | gates: adds `upgrade-insecure-requests` CSP directive for the Pyodide sandbox | reachable in: staging/adhoc/levelbuilder/production (skipped in development/test)
`unless Rails.env.development? || Rails.env.test?` | dashboard/app/controllers/report_abuse_controller.rb:174 | gates: sending the abuse-report Zendesk HTTParty POST/email | reachable in: staging/adhoc/levelbuilder/production (skipped in development/test)
`# if rack_env?(:production)` | dashboard/app/controllers/robots_controller.rb:11 | gates: commented-out robots.txt disallow-list logic (currently dead code, all envs serve `Allow: /`) | reachable in: N/A — inactive, whole branch commented out since 2025-02-28
`if CDO.rack_mini_profiler_enabled && params.key?(:pp) && (Rails.env.development? || current_user&.admin?)` | dashboard/app/controllers/application_controller.rb:48 | gates: authorizing the `rack-mini-profiler` request (via `?pp` param) | reachable in: development freely; any env for a signed-in admin, when the profiler config flag is on
`if Rails.env.development?` | dashboard/app/controllers/application_controller.rb:55 | gates: registers the `configure_web_console` before_action (Rails web console toggle via `?dbg` param) | reachable in: development only
`elsif rack_env?(:development, :adhoc)` | dashboard/app/controllers/application_controller.rb:94 | gates: rendering full CanCan::AccessDenied stack trace as plaintext instead of the normal 403 | reachable in: development and adhoc only
`PERMITTED_USER_FIELDS.concat(UI_TEST_ATTRIBUTES) if rack_env?(:test, :development)` | dashboard/app/controllers/application_controller.rb:222 | gates: extra Devise strong-parameter fields (UI-test-only user attributes) accepted on account update/sign-up/sign-in | reachable in: test and development only
`unless Rails.application.config.levelbuilder_mode || rack_env?(:test)` | dashboard/app/controllers/application_controller.rb:305 | gates: `require_levelbuilder_mode_or_test_env` — raises CanCan::AccessDenied for level create/modify actions | reachable in: levelbuilder-mode servers (any env with that config flag) plus test
`if rack_env?(:development, :test)` | dashboard/config/routes.rb:1146 | gates: mounts `/api/test/*` (TestController) and `/api/test/ai_proxy/assessment` (TestAiProxyController) routes at all | reachable in: development and test only
`if rack_env?(:staging, :test)` | dashboard/config/routes.rb:1157 | gates: mounts `/api/dev/check-dts` and `/api/dev/start-build` routes | reachable in: staging and test only
`unless Rails.env.production?` | dashboard/config/initializers/devise.rb:6 | gates: fallback Devise `secret_key` default when `CDO.dashboard_devise_secret` is unset | reachable in: development/test/staging/adhoc/levelbuilder (production requires the real secret)
`unless Rails.env.production?` | dashboard/config/initializers/devise.rb:102 | gates: fallback Devise `pepper` default when `CDO.dashboard_devise_pepper` is unset | reachable in: development/test/staging/adhoc/levelbuilder (production requires the real secret)

### Test-only routes guard (verbatim)

dashboard/config/routes.rb:1145-1163
```ruby
    # Utility routes not intended for use in production
    if rack_env?(:development, :test)
      scope '/api' do
        namespace :test, defaults: {format: 'json'} do
          TestController.instance_methods(false).each do |action|
            method = action.to_s.start_with?('get') ? :get : :post
            send(method, action, action: action)
          end
        end
        post 'test/ai_proxy/assessment', to: 'test_ai_proxy#assessment'
      end
    end
    if rack_env?(:staging, :test)
      scope '/api' do
        namespace :dev do
          post 'check-dts', action: :check_dts
          post 'start-build', action: :start_build
        end
      end
    end
```

dashboard/app/controllers/test_controller.rb:1-2
```ruby
# Controller actions used only to facilitate UI tests.
class TestController < ApplicationController
```

Note: `TestController` (every `/api/test/*` action, e.g. `create_user`, `create_migrated_script`, `destroy_script`) and `TestAiProxyController#assessment` (`/api/test/ai_proxy/assessment`) carry no per-action `before_action` environment guard of their own — the entire routes.rb:1146-1154 block above is the only gate, and it exists solely in `config/routes.rb`, not in the controllers. `DevController#start_build`/`#check_dts` (mounted by the second block, routes.rb:1157-1163) additionally re-check their own environment inline in the controller (see `dev_controller.rb:21` and `:42` above) — belt-and-suspenders on top of the routes-level guard.

`Api::V1::TestLogsController` (`test_logs#get_logs_since`, `test_logs#get_log_details`, mounted at dashboard/config/routes.rb:1237-1238) is NOT inside either `rack_env?` conditional and carries no environment guard of its own — reachable in every environment including production.

### Env/config mechanism notes

Which Rails environment a deployed box runs as is set once, outside the app, by the deploy tooling: the `cookbooks/cdo-apps` Chef recipes (`libraries/cdo_apps.rb`, `recipes/build.rb`) write `RACK_ENV`/`RAILS_ENV` into the box's environment based on the stack it's building (production, staging, test, adhoc, levelbuilder), and Puma/Rails read that at boot. `rack_env?` (used throughout the controllers above) is a CDO helper that compares against this same value, plus recognizes `:adhoc` as its own pseudo-environment for developer-named adhoc boxes (`CDO.stack_name` distinguishes one adhoc from another). `aws/cloudformation` treats `RAILS_ENV` as a rake-task input (e.g. `RAILS_ENV=production` for IAM stack commands) rather than a runtime source — the CloudFormation stack itself doesn't set the app's env, the Chef run on the instance does. In short: environment identity is a deploy-time fact baked in by Chef/the stack-naming convention, and every gate above just reads that fact back via `Rails.env`/`rack_env?`/`rack_env`.
