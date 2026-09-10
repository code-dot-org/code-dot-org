# Dashboard routing surface catalog

Source: `dashboard/config/routes.rb` (1595 lines), plus `dashboard/config/routes/api.rb`,
`dashboard/config/routes/marketing.rb`, `dashboard/config/routes/api/v1.rb` (drawn via `draw :api` /
`draw :marketing` at the top of routes.rb), and `dashboard/engines/hoc_legacy/config/routes.rb`
(mounted into `Dashboard::Application.routes.draw` from the engine, no separate `mount`).
No other `Rails.application.routes.draw` call exists in the repo outside `dashboard/`.

Route counts below come from `cd dashboard && bin/rails routes`, which expands every
metaprogrammed loop (STANDALONE_PROJECTS, HomeController/ApiController instance_methods,
TestController instance_methods, unit_routes lambda x {scripts, courses/units}, etc.) into
literal rows. Raw table: 1913 lines. Rows with a verb: 1907. Of those, 27 are Rails/gem
framework routes not defined in this app (`/rails/active_storage/...`,
`/rails/conductor/action_mailbox/...`, `/active_storage/...`, `/action_mailbox/ingresses/...`),
mounted automatically by the `activestorage`/`actionmailbox` engines because they're in the
Gemfile — leaving **1880 application-defined routes** across **173 distinct top-level path
prefixes**. Source lines below cite `routes.rb` unless stated otherwise.

Format: `VERB /path -> controller#action [name] [guard] — note (roles)`
A block that a metaprogrammed loop expands (`unit_routes`, `STANDALONE_PROJECTS.each`,
`api_methods.each`, etc.) is shown once as a template with the loop noted, not repeated
per generated row — expanding those literally would need the interpreter's exact key list,
which lives in Ruby constants (`ProjectsController::STANDALONE_PROJECTS`, etc.), not in
routes.rb text.

---

## 1. Host-constrained preview routes (lines 14-30)

Declared first so they win over every other route on these hosts; a request to any other
path on these hosts hits a custom 404, never falling through to `draw :api` etc.

- `constraints host: /^pyodide-sandbox\.(preview_codeaiprojects_host|preview_codeprojects_host)$/`
  - `GET / -> pyodide_sandbox#show` — pyodide sandbox iframe boot (student, machine-API/iframe)
- `constraints host: /^[^.]+\.(preview_codeaiprojects_host|preview_codeprojects_host)$/`
  - `GET / -> codeprojects_preview#show` — sandboxed HTML/weblab preview render (student)
  - `GET /weblab2_project_service_worker.js -> codeprojects_preview#weblab2_project_service_worker` — service worker for weblab2 preview (student)
  - `MATCH *path -> codeprojects_preview#not_found [via: :all]` — catch-all 404 on preview hosts (internal)
- `mount ActionCable.server => '/cable'` — websocket endpoint (student/teacher, machine-API)
- `GET chatter/index -> chatter#index` — undocumented; no auth filters found on ChatterController

`draw :api` and `draw :marketing` pull in the two extra route files (see sections 15 and 16).

## 2. Global redirects, frontend-studio, misc top-level (lines 39-66)

- `GET frontend-studio(/*path) -> frontend_studio#index [format: false]` — new-frontend SPA mount (all roles, client-side router)
- `GET /404 -> application#render_404 [via: :all]` — custom error page (internal)
- `GET /robots.txt -> robots#index`
- `GET /courses -> redirect(code_org_url('/students'))` — marketing redirect (student)
- `GET /users/sign_up -> redirect('/users/sign_up/account_type')`
- `GET /users/new_sign_up/{account_type,login_type,finish_student_account,finish_teacher_account} -> redirect(...)` — legacy sign-up path redirects
- `constraints host: CDO.codeprojects_hostname`
  - `GET /weblab/footer -> projects#weblab_footer` — weblab share-link footer (student, public)
- `constraints host: <anything but codeprojects apex or preview hosts>` wraps essentially the entire remainder of the file (through line ~1594) — this is "the normal studio.code.org host". Everything in sections 3-14 below is nested inside it unless noted.

## 3. Teacher dashboard SPA mount (lines 68-79)

- `resource :teacher_dashboard, only: []`
  - `GET home -> teacher_dashboard#show [as: home_teacher_dashboard]` — teacher dashboard landing (teacher)
  - `GET get_drawer_data -> teacher_dashboard#get_drawer_data` — drawer nav data (teacher)
  - `GET lesson_summaries_enabled_for_unit -> teacher_dashboard#lesson_summaries_enabled_for_unit` — feature-flag probe (teacher)
  - `resources :sections, only: [:show], param: :section_id, controller: :teacher_dashboard`
    - `GET .../parent_letter -> teacher_dashboard#parent_letter` — printable parent letter (teacher)
    - `GET .../courses -> teacher_dashboard#show` — section course view (teacher)
    - `GET .../unit -> teacher_dashboard#show` — section unit view (teacher)
    - `GET .../*path -> teacher_dashboard#show [via: :all, as: subpath]` — client-router catch-all (teacher)
  - Auth: `teacher_dashboard_controller.rb` has only `load_and_authorize_resource :section` (CanCan, no explicit before_action list) — every action is gated by section ownership.

`/teacher_dashboard*` total: 8 literal routes per `bin/rails routes` (home, get_drawer_data,
lesson_summaries_enabled_for_unit, section show/parent_letter/courses/unit/subpath).

## 4. Student/teacher app-data APIs (lines 81-138)

- `resources :notifications, only: [:index]` + `POST mark_as_read` — notifications (student/teacher)
- `resource :user_preference, only: [:update]` + `GET font_size/console|editor`, `GET theme` — per-user UI prefs (all)
- `resources :survey_results, only: [:create]` (json) — survey capture (student/teacher)
- `resource :pairing, only: [:show, :update]` — pair-programming state (student)
- `resources :user_levels, only: [:update, :destroy]`; `POST delete_predict_level_progress`; `GET get_token`; `GET level_source/:script_id/:level_id(/user/:user_id)`; `GET section_summary/:section_id/:level_id` — per-level progress (student/teacher)
- `resources :student_work_evaluations, only: [:create]` + `GET :user_id/:level_id/:unit_id` (collection) — AI/teacher evaluation fetch (teacher)
- `resources :student_work_evaluation_summaries, only: [:create]`
- `resources :user_level_interactions, only: [:create]`
- `resources :skills, only: [:create, :index, :update, :destroy]` + `GET section/:section_id/unit/:unit_name` — skill tracking (teacher)
- `PATCH /api/v1/user_scripts/course/:course_id/unit/:script_id -> api/v1/user_scripts#update`
- `GET /download/:product -> hoc_download#index` — Hour of Code app download (student, public)
- `GET /terms-and-privacy`, `/dashboardapi/terms-and-privacy -> home#terms_and_privacy` (public)
- `GET /home -> home#home` (student/teacher)
- `GET /incubator`, `/musiclab`, `/projectbeats -> redirect(...)` — marketing redirects
- `GET /musiclab/{menu,gallery,embed,analytics_key} -> musiclab#...` — Music Lab gallery/embed (student, public)
- `resources :activity_hints, only: [:update]`; `resources :hint_view_requests/authored_hint_view_requests, only: [:create]`; `resources :puzzle_ratings, only: [:create]` — level-hint telemetry (student)
- `resources :callouts` (full CRUD, 5 routes) — UI callout/tooltip admin (levelbuilder/internal)
- `resources :congrats, only: %i[index show], param: :course_name`
- `resources :json_videos, only: [:create,:update,:destroy]` + member `content`, collection `search` — levelbuilder video metadata (levelbuilder)
- `resources :videos` (full CRUD) + collection `test` — video asset admin (levelbuilder)
- `resources :images, only: [:new]`
- `GET /ai_iteration/tools`, `/ai_iteration/image_safety_eval -> ai_iteration#...` — internal AI tooling (internal-staff)
- `POST /student_code_samples`, `/free_response_answers -> student_work_sample#...` (teacher)
- `resources :maker, only: [] { get :setup }` — maker toolkit setup (student)
- `GET media -> media_proxy#get`, `GET xhr -> xhr_proxy#get`, `GET redirected_url -> redirect_proxy#get` — outbound content proxies (student, machine-API)

## 5. Curriculum docs / programming-environment reference (lines 178-224)

- `GET docs/ -> programming_environments#docs_index`
- `GET docs/:programming_environment_name -> programming_environments#docs_show` (constrained to applab|gamelab|spritelab|weblab)
- `GET docs/:env/:expression_key(/index.html) -> programming_expressions#docs_show`
- `GET docs/concepts/data-library(/:key) -> data_docs#index|show`
- `GET docs/*path -> curriculum_proxy#get_doc`; `GET curriculum/*path -> curriculum_proxy#get_curriculum` — legacy curriculum.code.org proxy fallback (public)
- `GET /catalog -> curriculum_catalog#index` (public)
- `resources :programming_environments, param: 'name', path: '/docs/ide/'` nested `programming_expressions` (path `/expressions`) and `programming_classes` (path `/classes`), each with a `show_by_keys`/`get_serialized` member route — API reference docs (public, curriculum-authored)
- `GET lesson_feedbacks/by_student -> lesson_feedbacks#show_by_student` (student)

`docs` prefix: 28 routes; `programming_environments` 18; `programming_expressions` 11;
`programming_classes` 9 (per `bin/rails routes`, includes the levelbuilder-admin block in
section 8 too).

## 6. Sections (student roster) (lines 214-260)

- `resources :sections, only: [:show, :new, :edit]` + member `log_in`, `retrieve_lessons_for_dropdown`; collection `section_instructors_verified`, `archive_all` — teacher's section UI (teacher)
  - Auth (`sections_controller.rb`): `before_action :load_section_by_code, only: [:log_in, :show]`; `load_and_authorize_resource :section, only: [:edit]`; `skip_before_action :verify_authenticity_token, only: [:archive_all]`
- `concern :section_api_routes` (defined here, consumed at lines ~903 `dashboardapi` scope and ~1170 `api/v1` namespace) — full JSON CRUD for sections/students/join/leave/code-review-groups/ai_chat_access_level/suggested_lesson, plus demo-section preset/reset/create — teacher + machine-API (React section UI)
- `concern :assessments_routes` (consumed same two places) — assessments index + section_responses/surveys/feedback (teacher)
- `POST /dashboardapi/sections/transfers`, `/api/sections/transfers -> transfers#create` — section-transfer flow (teacher)

`sections` prefix alone: 7 routes; the concern is drawn twice (dashboardapi + api/v1), each
contributing its own set — see section 12/13 counts.

## 7. Legacy share links, auth (devise), root (lines 263-350)

- `GET /sh/:id(/:action_id)`, `/u/:id(/:action_id) -> redirect('/c/...')` — legacy share-link redirects (public)
- `resources :level_sources, path: '/c/', only: [:show,:edit,:update]` + member `generate_image`, `original_image` — legacy shared-project view (public/student)
  - Auth (`level_sources_controller.rb`): `before_action :authenticate_user!, only: [:update]`; `load_and_authorize_resource`; `check_authorization`
- `resources :obfuscated_level_sources, path: '/r/', controller: :level_sources, param: :level_source_id_and_user_id, only: [:show,:edit,:update]` + same members — same controller/auth, newer share-link format including the sharer's id so a self-deleted user's content 404s
- `GET /share/:id -> redirect('/c/%{id}')`
- `devise_scope :user do ... end` (line 305) — hand-written auth routes layered around Devise: `oauth_sign_out/:provider`, `users/begin_sign_up`, `users/sign_up*` (account_type/login_type/gdpr_check/finish_student_account/finish_teacher_account/personalization_information), `PATCH dashboardapi/users -> registrations#update`, `users/upgrade`, `users/set_student_information`, `users/email`, `users/parent_email`, `users/user_type`, `users/cancel`, `POST users/auth/:id/disconnect -> authentication_options#disconnect`, `users/migrate_to_multi_auth`, `users/to_destroy`, `reset_session`, `lockout`, `expire_other`, `users/existing_account`, `users/edit` (student/teacher signup + account-linking)
- `devise_for :users, controllers: {omniauth_callbacks:, registrations:, confirmations:, sessions:, passwords:}` (line 331) — standard Devise route set (sign_in/sign_out/password reset/confirmation/omniauth) layered under the same custom controllers (all roles)
  - Auth notes: `omniauth_callbacks_controller.rb` — `skip_before_action :clear_sign_up_session_vars`; `before_action :check_account_linking_lock`. `registrations_controller.rb` — `before_action :require_no_authentication, only:[...]`; `prepend_before_action :authenticate_scope!, only:[...]`; `skip_before_action :verify_authenticity_token, only:[:set_student_information]`. `sessions_controller.rb` — no controller-level before_action (relies on Devise defaults).
- `GET discourse/sso -> discourse_sso#sso` — Discourse SSO handoff (teacher, internal community forum)
- `root to: 'home#index'`
- `GET /home_insert -> home#home_insert`; `GET /health_check -> home#health_check` — LB health check (machine-API)
  - `home_controller.rb` skips CSRF on `set_locale`, skips sign-up-session-clear on `terms_and_privacy`, skips Statsig init on `health_check`
- `namespace :home { HomeController.instance_methods(false).each { |a| get a, action: a } }` — every public method on HomeController auto-mounted as `GET /home/:method_name` (internal convention, not enumerable without loading the class)

## 8. Projects (lines 349-408) — the largest single prefix (513 routes)

- `resources :p, path: '/p/', only: [:index]` + `collection { ProjectsController::STANDALONE_PROJECTS.each { |key,val| get "/#{key}", to: 'projects#redirect_legacy', as: key } }` plus a bare `/` redirect to `/projects` — legacy short-link redirector per lab type (student, public)
- `GET /gallery -> redirect('/projects/public')`
- `GET projects/:project_type/:channel_id/submission_status`; `POST .../submit -> projects#...` — assignment submission (student)
- `GET projects/featured -> projects#featured`; `featured_projects` resource-less `destroy`/`unfeature`/`feature`/`bookmark` — curated gallery moderation (internal-staff)
- `GET projects/:channel_id/extra_links -> projects#extra_links`
- `resources :projects, path: '/projects/', only: [:index]` with a `collection do ProjectsController::STANDALONE_PROJECTS.each do |key,_| ... end end` block generating, per lab key: `GET /#{key} -> projects#load`, `GET /#{key}/new -> projects#create_new`, `GET /#{key}/:channel_id -> projects#show` (or, for `weblab`, a cross-host `redirect` to codeprojects.org), `GET /#{key}/:channel_id/edit -> projects#edit`, `.../view -> projects#show [readonly:true]`, `.../embed -> projects#show [iframe_embed:true]`, `.../embed_app_and_code -> projects#show`, `.../remix -> projects#remix`, `.../export_create_channel`, `.../export_config`, `.../can_publish_age_status` — this is the student project editor/viewer/embed surface for every lab (student, public for embeds)
  - Auth (`projects_controller.rb`): `before_action :authenticate_user!, except: [:load,:create_new,:show,:edit,:readonly,:redirect_legacy,:public,:index,:export_config,:weblab_footer,:get_or_create_for_level,:can_publish_age_status,:submission_status,:submit]` — i.e. viewing/loading/editing a project by channel id needs **no login** (anonymous/shared projects), only mutating or admin-adjacent actions do; `before_action :redirect_admin_from_labs, only:[:load,:create_new,:show,:edit,:remix]`; `before_action :authorize_load_project!, only:[:load,:create_new,:edit,:remix]`; scattered `authorize! :submission_status/:submit/:load_project` calls
  - `GET /:tab_name -> projects#index [constraints: tab_name: public|libraries]` — public/library gallery tabs (public)
- `GET projects(/script/:script_id)/level/:level_id(/user/:user_id) -> projects#get_or_create_for_level` (student/teacher-viewing-student)

## 9. Locale, blocks pools, libraries, datasets, levels (lines 411-490)

- `POST /locale -> home#set_locale`; hardcoded `/flappy|playlab|artist/lang/ar` shortcuts; `GET /lang/:locale`, `GET *i18npath/lang/:locale -> home#set_locale` — locale switch (all)
- `GET pools -> pools#index`; `scope 'pools/:pool' { resources :blocks }` — Blockly block-pool admin (levelbuilder)
- `resources :shared_blockly_functions, path: '/functions'`
- `GET helpful_links -> helpful_links#index`
- `resources :libraries` (full CRUD) + collection `get_updates` — shared code libraries (levelbuilder/teacher)
- `resources :datasets, param:'dataset_name', only:[:index,:show,:update,:destroy]` + collection `manifest/edit`, `manifest/update` — App Lab dataset admin
  - Auth (`datasets_controller.rb`): `authenticate_user!`; `require_levelbuilder_mode`
- `resources :levels` (full CRUD) with many member routes: `get_rubric`, `embed_level`, `edit_blocks/:type`, `edit_exemplar`, `build_quiz_questions`, `get_serialized_maze`, `update_properties`, `update_blocks/:type`, `clone`, `update_start_code`, `update_exemplar_code`, `level_properties`, `extra_links`, `update_bubble_choice_settings`, `add_skill`, `remove_skill`; plus nested `quiz_configuration` and `quiz_question_placements` (attach/detach) — **the core levelbuilder authoring surface for individual levels**
  - Auth (`levels_controller.rb`): `authenticate_user!, except:[:show,:level_properties,:embed_level,:get_rubric,:get_serialized_maze]`; `require_levelbuilder_mode_or_test_env, except:[...]`; `load_and_authorize_resource except:[:create]`; explicit `authorize! :create, Level` in the create actions — read-only level data is public, everything else needs levelbuilder mode or the test env
- `resources :quiz_questions, only:[:index,:show,:update]` + collection `course_unit_search`
- `POST level_assets/upload -> level_assets#upload`
- `resources :level_starter_assets, only:[:show], param:'level_name'` + member `GET /:filename`, `POST ''`, `DELETE /:filename`, `GET/POST /uuid/:uuid` — per-level starter file storage (levelbuilder)
- `resources :course_offerings, only:[:edit,:update], param:'key'` + collection `quick_assign_course_offerings`
- `GET course_offerings/self_paced_pl_course_offerings_for_workshops`

`levels` prefix: 32 routes; `level_starter_assets` 6; `libraries` 9; `datasets` 4; `pools` 9;
`functions` 8.

## 10. Courses/units/scripts/lessons — levelbuilder authoring core (lines 490-700)

- `unit_routes = lambda do ... end` (line 507) — a shared block of routes (`reset`, `next`, `hidden_lessons`, `toggle_hidden`, member `vocab/resources/code/standards/instructions/get_rollup_resources/generate/listing/lesson_outlines`, nested `lessons` with `student/extras/summary_for_lesson_plans/edit/generate/slides(+generate,+edit)/level_properties/tutor(+gallery)`, nested `script_levels` under `/levels` with `page/:puzzle_page` and `sublevel/:sublevel_position` member routes plus a separate `summary` route, nested `lockable_lessons`, and PLC `preview-assignments`/`confirm_assignments`/`pull-review`) — reused at both `resources :units` (inside `courses`) and `resources :scripts, path:'/s/'` (line 700), so every route below is doubled under `/courses/:course_name/units/:position/...` and `/s/:script_name/...`
- `resources :courses, param:'course_name'` + collection `all`; member `vocab/resources/code/standards/get_rollup_resources`; nested `reference_guides` (path `guides`) and `units` (controller `scripts`, via `unit_routes`) — **the curriculum-course authoring/viewing surface**
  - Auth (`courses_controller.rb`): `require_levelbuilder_mode_or_test_env, except:[:index,:show,:vocab,:resources,:code,:standards]`; `authenticate_user!, except:[same list]`; `check_authorization except:[:index]` — course browsing is public, editing needs levelbuilder mode
  - Auth (`scripts_controller.rb`, backs both `units` and `/s/` scripts): `require_levelbuilder_mode, except:[:show,:vocab,:resources,:code,:standards,:edit,:update,:new,:create]`; `require_levelbuilder_mode_or_test_env, only:[:edit,:update,:new,:create,:generate,:update_lesson_outlines]`; `authenticate_user!, except:[:show,:vocab,:resources,:code,:standards]`; `check_authorization`; `authorize_script, except:[:update]`; `load_and_authorize_resource class:'Unit', only:[:update]` — same public-read/levelbuilder-write split, with an extra explicit `authorize!` for `update` because of a CanCan quirk noted in a code comment (TEACH-1975)
  - Auth (`lessons_controller.rb`): `load_and_authorize_resource`; `require_levelbuilder_mode_or_test_env, except:[:index,:show,:student_lesson_plan,:level_properties,:level_properties_by_id,:tutor,:tutor_gallery]`; `authenticate_user!, only:[:tutor,:tutor_gallery]`
  - Auth (`script_levels_controller.rb`): `check_authorization`; per-action `authorize! :read, ScriptLevel` calls; `require_levelbuilder_mode` inside one action (levels-solutions view)
- `get '/course/:course_name' -> redirect('/courses/%{course_name}')`
- Hardcoded legacy unit redirects: `/courses/:course_course_name/guides/edit`; ~20 `get '/s/csX...' -> redirect(...)` lines mapping old numbered CSD/CSP unit paths to new `/courses/*/units/*` paths (public, one-time migration aids)
- `resources :data_docs, param: :key` + collection `edit` — data-library doc authoring (levelbuilder)
- `resources :jit_pl_concepts, only:[:new,:create,:edit,:update,:destroy]` deeply nested with `jit_pl_misconceptions` -> `jit_pl_exemplars`, plus sibling `jit_pl_exemplars`/`jit_pl_teaching_tips`, plus collection `edit_all` — "just in time" PL content authoring (levelbuilder)
- `resources :lessons, only:[:edit,:update]` (a **second**, top-level lessons resource, by numeric id rather than nested position) + member `show(_by_id)`, `level_properties(_by_id)`, `generate`, `slides(+generate,+edit)`, `slides_data`, `clone`
- `resources :resources, only:[:create,:update]` + collection `search`
- `resources :vocabularies, only:[:create,:update,:destroy]` + collection `search`
- `resources :programming_classes, only:[:new,:create,:edit,:update,:show,:destroy]` + collection `get_filtered_results`; member `clone`
- `resources :programming_expressions, only:[:index,:new,:create,:edit,:update,:show,:destroy]` + collection `search`,`get_filtered_results`; member `clone`
- `resources :programming_environments, only:[:index,:new,:create,:edit,:update,:show,:destroy], param:'name'` + member `get_summary_by_name`, nested `programming_expressions` with `show_by_keys`
- `resources :programming_methods, only:[:edit,:update]`
- `resources :standards, only: [] { collection { get :search } }`
- Legacy `/stage/x/{extras,puzzle}` -> `/lessons/x/{extras,levels}` redirects, and `/lockable/x/puzzle` -> `/lockable/x/levels`
- `resources :scripts, path:'/s/', &unit_routes` — the actual `/s/:script_name/...` unit-player surface (student/teacher play a unit; levelbuilder edits it)

`courses` prefix: 70 routes; `s` prefix: 71 routes; `jit_pl_concepts`: 23; `lessons`: 11;
`programming_classes`: 9.

## 11. Certificates, scrapbook, hoc/flappy/jigsaw, join, admin (lines 700-830)

- `resources :certificate_images, only:[:show], param:'filename'`
- `resources :print_certificates, only:[:show], param:'encoded_params'` + collection `POST batch`
- `resources :certificates, only:[:show], param:'encoded_params'` + collection `blank`, `batch` (get+post)
- `GET /scrapbook -> scrapbook#show`; `GET /scrapbook/images/:token -> scrapbook#image` — signed-token image serving, no session dependency (student)
- `GET /beta -> redirect('/')`
- `GET /hoc/reset`, `/hoc/:chapter`; `/flappy/:chapter`; `/jigsaw/:chapter -> script_levels#...` — legacy Hour of Code / one-off unit shortcuts (student, public)
- `GET/POST /weblab/host`, `/weblab/network-check -> weblab_host#...`
- `GET/POST /join(/:section_code) -> followers#student_user_new / student_register` — student self-enrollment into a section via code (student)
  - Auth (`followers_controller.rb`): `before_action :load_section`
- `GET /logged_out`, `/teacher_account_required -> gates#...` — post-logout / wrong-account-type landing pages
- `POST /milestone/:user_id/... -> activities#milestone` (3 URL shapes) — progress-tracking beacon (student, machine-API)
- `resources :regional_partners` (full CRUD) + member `assign_program_manager`, `remove_program_manager/:id`, `add_mapping`, `remove_mapping/:id`, `replace_mappings` — regional partner org admin
  - Auth (`regional_partners_controller.rb`): `load_and_authorize_resource` only
- `GET regional-partner-search -> redirect('/professional-learning/workshops')`

### `scope path: '/admin'` (lines 767-830) — internal-staff dashboards, "admin" = CanCan `:read, :reports` ability, not a DB role flag

- `controller :admin_reports` — `GET / -> directory [as: admin_directory]`; `GET levels -> level_completions`; `GET level_answers`; `GET debug -> admin_debug`
  - Auth (`admin_reports_controller.rb`): `authenticate_user!`; `before_action :require_admin`; `check_authorization`
- `resources :admin_search, only:[], path:'/'` + collection `find_students`, `lookup_section` (get+post), `undelete_section` (post) — support-staff student/section lookup tool
- `resources :admin_pilots, only:[:index,:create,:show], path::pilots, param:'pilot_name'` + collection `add_to_pilot`, `remove_from_pilot` — pilot-program enrollment admin
  - Auth (`admin_pilots_controller.rb`): `authenticate_user!`; `require_admin`; `check_authorization`
- `controller :admin_nps` — `GET /nps/nps_form`, `POST /nps/nps_update` — NPS survey admin
- `resource :dynamic_config, only:[:show], controller: :dynamic_config` — internal engineering config viewer
  - Auth: `authenticate_user!`; explicit `authorize! :read, :reports` per action (same ability as `require_admin`, called directly rather than via the helper)
- `resource :gatekeeper, only:[:show,:update,:destroy]`; `resource :dcdo, only:[:show,:update]`; `resource :feature_mode, only:[:show,:update]` — the three internal feature-flag stores (Gatekeeper legacy, DCDO, feature_mode); all three follow the same `authenticate_user!` + `authorize! :read, :reports` pattern
- `controller :admin_users` — long list of support tools: `account_repair(_form)`, `assume_identity(_form)` (impersonation), `delete_user`/`undelete_user`, `manual_pass(_form)`, `permissions(_form)`/`permissions/csv`, `grant_permission`/`revoke_permission`/`bulk_grant_permission`, `studio_person(_form)`/`studio_person_merge`/`studio_person_split`/`studio_person_add_email_to_emails`, `user_progress(_form)`, `user_projects(_form)`, `user_sections(_form)`, `user_project(_restore_form)`, `delete_progress(_form)`, `lookup_by_email(_form)`, `mass-delete-student-progress`, `convert_usernames_to_ids`, `delete_user_progress`
  - Auth (`admin_users_controller.rb`): `authenticate_user!`; `before_action :require_admin` — same admin-reports ability gates every one of these, including account impersonation and mass student-progress deletion
- `GET :styleguide -> redirect('/styleguide/')`

`admin` prefix: 54 routes (per `bin/rails routes`).

## 12. LTI, OAuth, abuse report, v3 legacy API (lines 832-882)

- `MATCH /lti/v1/login(/:platform_id) [get,post]`, `/lti/v1/authenticate [get,post]`, `/lti/v1/sync_course [get,post] -> lti_v1#...`; `POST /lti/v1/upgrade_account -> lti_v1#confirm_upgrade_account`; `GET /lti/v1/integrations -> redirect('/lti/v1/integrations/new')` (machine-API, LMS-initiated)
  - Auth (`lti_v1_controller.rb`): `skip_before_action :verify_authenticity_token` (must accept cross-origin LTI launch POSTs)
- `namespace :lti { namespace :v1 { ... } }`:
  - `resources :integrations, only:[:new,:create]`
  - `controller :dynamic_registration` — `GET/POST dynamic_registration -> new_registration/create_registration` — LTI 1.3 dynamic registration handshake
  - `resources :sections, only:[] { collection { patch :bulk_update_owners } }`
  - `resource :deep_linking, only::show { post :submit, on::collection }` — LTI deep-linking content picker
  - `namespace :account_linking` — `landing`, `existing_account`, `finish_link`, `link_email` (post), `new_account` (post), `unlink` (post) — LTI roster account-linking flow (teacher, LMS-driven)
- `GET /oauth/jwks -> oauth_jwks#jwks` — public JWKS endpoint for the LTI/OAuth signing keys (machine-API)
- `GET /notes/:key -> notes#index`
- `resources :zendesk_session, only:[:index]` — Zendesk SSO handoff (internal support)
- `controller :report_abuse` — `GET/POST /report_abuse -> report_abuse_form/report_abuse` (public)
- `scope path:'/v3' { controller :report_abuse { ... } }` — legacy v3 API: `GET/DELETE channels/:channel_id/abuse`, `POST .../abuse/delete`, `POST .../abuse/image`, `PATCH (:endpoint)/:encrypted_channel_id [constraints: endpoint: animations|assets|sources|files|libraries]` — old asset-abuse-moderation API surface, "partial ports of legacy v3 APIs" per comment (machine-API/internal)

`lti` prefix: 18 routes; `v3` prefix: 5.

## 13. Experiments, peer reviews, PLC, professional learning / PD workshops (lines 884-1004)

- `GET /too_young -> too_young#index` — COPPA age-gate landing (student)
- `POST /sms/send -> sms#send_to_phone`
- `GET /experiments -> experiments#index`; `resource :experiments, only:[]` with `GET set_single_user_experiment/:name`, `GET disable_single_user_experiment/:name`, `POST leave/:name` — the two `get` routes are called out in a comment as "state-mutating GETs, kept only so they can be clickable links in emails" (internal-staff/experiment admin, one-off exception to REST convention)
- `GET /peer_reviews/dashboard -> peer_reviews#dashboard`; `resources :peer_reviews` (full CRUD) — teacher code-review assignment
  - Auth (`peer_reviews_controller.rb`): `load_and_authorize_resource, except:[:pull_review,:dashboard]`
- `GET /plc/user_course_enrollments/group_view`, `/manager_view/:id`; `GET /deeper-learning -> plc/user_course_enrollments#index`; `namespace :plc { root; resources :user_course_enrollments; resources :course_units, only:[] { collection { get :launch; post :launch_plc_course } } }` — Professional Learning Communities enrollment (teacher/facilitator)
- `concern :api_v1_pd_routes` (defined line ~918, drawn inside `namespace :api { namespace :v1 { ... } }` at line ~1153) — the PD/workshop management API: `resources :workshops` with `filter`/`upcoming_teachercons` (collection), `start/unstart/end/reopen/summary/potential_organizers` (member), nested `enrollments`, `attendance` (custom index/show/create/destroy variants keyed by session+user or session+enrollment), five `*_survey_report` actions, four `foorm/*_survey_report` actions; plus sibling `workshop_summary_report`, `teacher_attendance_report`, `course_facilitators`, `workshop_organizers` (index-only), `enrollments/:code` cancel, `enrollment/:id/scholarship_info`, `enrollments/move`, `legacy_survey_summaries`, `pre_workshop_surveys`/`teachercon_surveys`/`regional_partner_mini_contacts`/`international_opt_ins` (create), `regional_partner_workshops(+find)`, `regional_partners/find`, `foorm/workshop_survey_submission`, `resources :applications` with `quick_view/cohort_view/search/fit_cohort`, and a `namespace :foorm { namespace :forms {...}; namespace :library_questions {...} }` sub-block — **the entire PD facilitator/organizer/regional-partner workshop-management API** (internal-staff/facilitator, machine-API)
- Direct (non-namespaced) `dashboardapi/v1/...` PD endpoints: `regional_partners/find`, `regional_partners/show/:partner_id`, `pd/workshops_as_{facilitator,organizer,program_manager}_for_pl_page`, `pd/regional_partner_mini_contacts` (post), `amazon_future_engineer_submit` (post), `foorm/simple_survey_submission` (post)
- Public-facing PL marketing pages: `my-professional-learning`, `professional-learning/{courses,workshops,workshops/:id,contact-regional-partner,facilitator/*,regional-partner/playbook,workshops_as_*_for_pl_page,regional_workshop_data/:zip}` -> `pd/professional_learning#...` (teacher, public)
- `namespace :pd` (line 1029) — workshop_dashboard SPA mount (`get 'workshop_dashboard(/*path)' -> workshop_dashboard#index`), plus a long list of survey flows (`misc_survey`, `workshop_survey`/`workshop_daily_survey` incl. CSF pre/post variants, `post_course_survey`, academic-year-workshop `:workshop_subject/{pre,day,post}` with regex constraints on the trailing segment), `workshops/:id/{enroll(redirect),join}`, `workshop_enrollment/:code(+/cancel)`, `pre_workshop_survey/:code`, `teachercon_survey/:code`, `generate_workshop_certificate/:code`, `attend/:session_code(+/join,+/upgrade)`, `workshop_admins` directory, `workshop_user_management/{facilitator_courses,assign_course,remove_course}`, `regional_partner_contact/new`, `regional_partner_mini_contact/new`, `international_workshop(+/:id/thanks)` — PD attendee-facing survey/enrollment flows (teacher/facilitator, public no-login forms in places)

`pd` prefix: 46 routes; `plc` prefix: 13; `peer_reviews`: 9.

## 14. `dashboardapi` legacy JSON API + `api` namespace (lines 1006-1090)

- `GET /dashboardapi/section/:id`, `section_text_responses/:id`, `section_courses/:id -> api#...`
- `scope 'dashboardapi', module:'api/v1' { concerns :section_api_routes; concerns :assessments_routes }` — same concerns as section 6, now mounted under `/dashboardapi` at `api/v1` controllers (teacher, machine-API/React)
- `GET dashboardapi/course_summary/:course_name`, `unit_summary/:unit_name`, `unit_summary/:course_name/:unit_position`, `lesson_materials/:unit_id -> api#...`
- `api_methods = ApiController.instance_methods(false) + view-template-basenames-under app/views/api/*` (computed at boot) then `namespace :dashboardapi, module::api { api_methods.each { |a| get a, action:a } }` — every public `ApiController` method (and every template under `app/views/api/`) auto-mounted at `GET /dashboardapi/:method_name`; the exact list isn't in routes.rb, it's derived from the controller class + view directory at boot
- `GET /api/v1/pd/workshops_user_enrolled_in`
- `POST/GET /api/lock_status -> api#update_lockable_state / lockable_state`
- `GET /dashboardapi/script_structure/:script`, `/api/script_structure/:script` (+ `courses/:course_name/units/:unit_position` variants, both dashboardapi and api prefixed) `-> api#script_structure`
- `GET /dashboardapi/script_standards/:script`, `/api/teacher_panel_progress/:section_id`, `/api/teacher_panel_section`, `/dashboardapi/section_level_progress/:section_id`, `/api/user_progress/:script`, `/api/user_app_options/:script/:lesson_position/:level_position/:level`, `/api/example_solutions/:script_level_id/:level_id`
- `PUT /api/firehose_unreachable -> api#firehose_unreachable`
- `namespace :api { api_methods.each { |a| get a, action:a } }` — the same auto-mount, again, at `/api/:method_name` (so every ApiController action is reachable at both `/api/*` and `/dashboardapi/*`)

`api` prefix: 252 routes; `dashboardapi` prefix: 100 routes.

## 15. Test-only and staging-only routes — GUARDED, called out separately (lines 1126-1145)

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

- **Guard 1 (exact text): `if rack_env?(:development, :test)`** — wraps `GET/POST /api/test/*` (every
  public method on `TestController`, dispatched GET if the method name starts with `get`, else
  POST) plus `POST /api/test/ai_proxy/assessment`. `rack_env?` is a CDO helper checking
  `Rails.env`/the deploy environment; these routes do not exist at all outside dev/test, so a
  production request 404s at the routing layer, not at a controller filter.
- **Guard 2 (exact text): `if rack_env?(:staging, :test)`** — wraps `POST /api/dev/check-dts` and
  `POST /api/dev/start-build -> api/dev#...`, CI/deploy-orchestration hooks (staging build
  pipeline calling back into the app), machine-API only, developer/internal-staff triggered.

## 16. `namespace :api { namespace :v1 { ... } }` — the main React-app JSON API (lines 1148-1272)

- `resources :scrapbook_entries, only:[:create,:index,:destroy] { post :image, on::collection }`
- `concerns :api_v1_pd_routes` (section 13) and `concerns :section_api_routes` (section 6), both re-drawn here under `/api/v1/...`
- `namespace :users { resource :settings, only::show, path:'me/settings' }`
- Long list of `users/:user_id/...` and `users/...` toggle/preference endpoints: `using_text_mode`, `display_theme`, `mute_music`, `sort_by_family_name`, `ai_rubrics_disabled`, `ai_differentiation_enabled`, `has_seen_ai_assessments_announcement`, `disable_lti_roster_sync`, `has_completed_ai_differentiation_welcome`, `contact_details`, `current(+/permissions)`, `netsim_signed_in`, `school_name`, `tos_version`, `cached_page_auth_redirect`, `post_ui_tip_dismissed`, `postpone/dismiss_census_banner`, `dismiss_donor_teacher_banner`, `dismiss_parent_email_banner`, `set_seen_ta_scores`, `has_dismissed_personalization_alert`, `teacher_onboarding_hidden` — one route per student/teacher UI-state flag (student/teacher)
- `PATCH user_school_infos(/:id/update_last_confirmation_date)`
- `GET school-districts/:state`, `schools/:school_district_id/:school_type`, `schools/:id`, `regional_partners/:school_district_id/:course`, `regional_partners(+/capacity,+/enrolled)` — school/district lookup for signup forms (public)
- `GET projects/gallery/public/:project_type(/:featured_before)`, `projects/personal`; `resources :section_libraries, only::index`
- `GET/POST test_logs/*prefix/...` — UI-test-run status pages (internal-staff, no env guard beyond auth)
- `GET peer_review_submissions/index`, `/report_csv` — peer-review admin export
- `resources :section_instructors, only:[:index,:create,:destroy]` + member `accept`/`decline`; `GET section_instructors/check`, `/:section_id` — co-teacher invite flow (teacher)
- `resources :ml_models, only:[:show,:destroy]` + collection `names`, `save` — ML model registry (internal-staff)
- `resources :teacher_feedbacks, only:[:index,:create]` + collection `get_feedback_from_teacher/get_feedbacks/count`; member `increment_visit_count`
- `resources :users { collection { get :signed_in } }` (a **third**, API-namespaced `users` resource, distinct from Devise's and the levelbuilder one)

`users` prefix: 58 routes across all these namespaces combined.

## 17. AI features — lesson summaries, podcasts, rubrics, aichat, aidiff (lines 1272-1420, 1466-1531)

- `resources :feedback, controller:'teacher_feedbacks'` (full CRUD alias)
- `resources :ai_lesson_summaries, only::show { collection { get :show; get :ai_lesson_summary_podcast_script; get :request_ai_lesson_summaries } }`
  - Auth (`ai_lesson_summaries_controller.rb`): `authenticate_user!` only
- `resources :ai_student_podcasts, only:[] { collection { get :show; post :generate_podcast; get :retrieve_podcast_from_s3 } }`
- `resources :ai_lesson_summary_podcasts, only::show { ... }` **and again**, later, a second full `resources :ai_lesson_summary_podcasts do collection { get :generate_podcast } end` block (two separate declarations for the same resource name, line ~1288 and ~1330 — the routes merge, this isn't a typo but is worth flagging as duplicated declaration)
- `resources :student_snapshots, only:[]` + collection `lessons/:unit_id`, `cfu_levels/:lesson_id`, `cfu_responses/:lesson_id`, `exemplar_code/:lesson_id`, `units/:unit_id/lessons/:lesson_id/students/:student_id/code`, `ai_generated_lesson_feedback`, `lesson_insight`, `student_has_work_in_lesson` — teacher-facing per-student AI insight views (teacher)
- `GET /lesson_feedbacks/saved_feedback`; `resources :lesson_feedbacks, only:[:create,:update]`; `resources :user_lesson_reflections, only::create`; `resources :user_lesson_objective_reflections, only::create`
- `resources :rubrics, only:[:create,:edit,:new,:update,:show]` + collection `find`; member `get_ai_evaluations`, `get_teacher_evaluations(_for_all)`, `ai_evaluation_status_for_user(_for_all)`, `get_ai_rubrics_tour_seen`, `update_ai_rubrics_tour_seen`, `run_ai_evaluations_for_user(_for_all)`, `submit_evaluations` — AI+teacher rubric grading (teacher)
  - Auth (`rubrics_controller.rb`): `require_levelbuilder_mode_or_test_env, except: [a long allow-list of the read/evaluation actions]`; `load_and_authorize_resource, except: [same list]` — rubric *authoring* is levelbuilder-gated, evaluating/viewing is not
- `resources :learning_goal_teacher_evaluations, only:[:create,:update]` + collection `get_evaluation`, `get_or_create_evaluation`
- `resources :learning_goal_ai_evaluation_feedbacks, only:[:create,:update]` + collection `get_by_ai_evaluation_id`
- `GET /backpacks/channel(/:app_type)`, `/backpacks/channels -> backpacks#...`
  - Auth (`backpacks_controller.rb`): `authenticate_user!`
- `resources :project_commits, only::create`; `GET project_commits/get_token`, `/:channel_id`
- `POST /browser_events/put_logs`, `/put_metric_data -> browser_events#...` — client telemetry ingest (machine-API)
- `GET /get_token -> authenticity_token#get_token`
- `POST /openai/evaluate(_section)`; `POST /openai/match_teaching_profile`
- `GET /ai_prompt_management/get_prompt`; `POST /ai_observability/add_internal_ai_tutor_dataset_item` (internal-staff)
- `resources :aichat_requests, only:[:create,:update]`; `POST aichat_request/start_chat_completion`; `GET aichat_request/chat_request/:id`
  - Auth (`aichat_requests_controller.rb`): only a `before_action :reassign_model_customizations, only:[:start_chat_completion]` — **no `authenticate_user!`** at the controller level for this resource
- `POST /aichat_events/log_chat_event`, `/submit_teacher_feedback`; `GET /aichat_events/chat_history`
- `GET /sprite_lab2/section_scenes`, `/external_scenes` — Lab2 Sprite Lab scene-jump API
- `POST /aichat/find_toxicity -> aichat#find_toxicity` — content-moderation check (machine-API)
- `resources :ai_interaction_feedback, only::create`; `resource :teaching_profile_data, only:[:show,:create,:update]`
- `resources :aidiff_threads, only:[:create,:index,:show]` + collection `curriculum_courses`; member `chat_completion`
- `resources :aidiff_artifacts, only:[:index,:create]`
- `resources :user_practice_problem_attempts, only:[:index,:update,:create,:show]`; `resources :practice_problems, only:[:index,:show]`
- `resources :challenges, only:[:index,:show] { member { get :starter_image } }`; `resources :challenge_responses, only:[:index,:create,:show] { collection { get :unit_counts }; member { post :evaluate } } }`; `resources :challenge_response_assets, only::show { member { put :upload } }` — "AI Diff" practice-problem feature
- `resources :aidiff_exit_tickets, only:[:index,:update,:create,:show]`; `resources :aidiff_lesson_hooks, only:[:index,:update,:create,:show]`; `resources :aidiff_messages, only:[] { member { post :submit_feedback } }`

## 18. Foorm survey builder, code review, javabuilder/AI gateway auth, sprites, misc (lines 1349-1466)

- `GET foorm/preview/:name [constraints: name: /.*/]`, `foorm/preview -> foorm_preview#...`
- `POST /safe_browsing -> safe_browsing#safe_to_open`
- `GET /curriculum_tracking_pixel -> curriculum_tracking_pixel#index` — 1x1 tracking pixel (public)
- `POST /profanity/find -> profanity#find`
- `GET /help -> redirect('https://support.code.org')`
- `GET /javabuilder/access_token`; `POST /javabuilder/access_token_with_override_{sources,validation,sources_and_validation} -> javabuilder_sessions#...` — signed token issuance for the external Javabuilder execution service (student, machine-API)
- `POST /ai_gateway/access_token -> ai_gateway_auth#get_access_token` — token issuance for the AI gateway service (machine-API)
- `resources :sprites, only::index, controller:'sprite_management'` + collection `sprite_upload`, `default_sprites_editor`, `release_default_sprites_to_production`, `select_start_animations` — Sprite Lab asset admin (levelbuilder/internal-staff)
- `resource :new_feature_feedback, only:%i[create show]`
- `GET /form/:path/configuration`, `/form/:path -> foorm/simple_survey_forms#...` — Foorm public survey-taking (public/teacher); comment notes these are deliberately kept outside the `foorm` namespace for simple URLs
- `GET/POST widget2, widget2/:id/update_code, widget2/new -> widget2#...`
- `namespace :foorm` — `resources :simple_survey_forms, only:[:index,:new,:create]`; `resources :forms, only::create` + member `update_questions`(put)/`publish`(put), collection `editor`; `resources :libraries, only:[]` + member `question_names`, collection `editor`; `resources :library_questions, only:[:create,:show,:update]` + member `published_forms_appeared_in` — Foorm survey-authoring admin (internal-staff/levelbuilder)
- `resources :code_reviews, only:[:index,:create,:update] { get :peers_with_open_reviews, on::collection }`
  - Auth (`code_reviews_controller.rb`): `authenticate_user!`; `check_authorization except:[:peers_with_open_reviews]`; explicit `authorize! :index_code_reviews/:create/:edit` calls per action
- `resources :code_review_comments, only:[:create,:update,:destroy]`

`foorm` prefix: 16 routes.

## 19. Policy compliance, datablock storage (lines 1532-1594)

- `namespace :policy_compliance` — `GET pending_permission_request`, `GET child_account_consent`, `POST child_account_consent -> child_account_consent_request` — child-account/COPPA consent flow (student's parent, public)
- `resources :datablock_storage, path:'/datablock_storage/:channel_id/', only:[]` + a large `collection` block implementing a full key-value + relational-table API for App Lab data/Game Lab key-value store: key-value (`set/get/delete/get_key_values`/`populate_key_values`), table (`create_table/add_shared_table/import_csv/export_csv/clear_table/delete_table/get_table_names/populate_tables`), column (`add_column/rename_column/coerce_column/delete_column/get_column/get_columns_for_table`), record (`create_record/read_records/update_record/delete_record`), library-manifest (`get_library_manifest`), project (`project_has_data/clear_all_data`) — **App Lab/Game Lab's persistent-data backend**, per-project channel scoped (student, machine-API from the running lab)

`datablock_storage` prefix: 26 routes; `policy_compliance`: 3.

## 20. `dashboard/config/routes/api.rb` (drawn via `draw :api` at line 33)

```ruby
Dashboard::Application.routes.draw do
  namespace :api do
    draw 'api/v1'
  end
end
```
Which pulls in `dashboard/config/routes/api/v1.rb`:
```ruby
namespace :v1 do
  namespace :roster do
    namespace :clever do
      resources :sections, only: [] do
        collection do
          post :sync, action: :sync_all
        end
      end
    end
  end
end
```
- `POST /api/v1/roster/clever/sections/sync -> api/v1/roster/clever/sections#sync_all` — Clever roster-sync webhook (machine-API, Clever calls this)

## 21. `dashboard/config/routes/marketing.rb` (drawn via `draw :marketing` at line 34)

```ruby
Dashboard::Application.routes.draw do
  namespace :marketing do
    namespace :teacher do
      resources :promotions, only: [:show]
    end
  end
end
```
- `GET /marketing/teacher/promotions/:id -> marketing/teacher/promotions#show` — in-app promo banner content (teacher)

## 22. `dashboard/engines/hoc_legacy/config/routes.rb` (mounted as its own `Dashboard::Application.routes.draw` block, no `mount` line — the engine's routes file is a second top-level draw call, not nested)

```ruby
Dashboard::Application.routes.draw do
  scope module: :hoc_legacy, path: HocLegacy::API_ROOT_PATH do
    resources :certificates, only: %i[show update], param: :session_id
    controller :tutorials do
      get '/begin/:code', action: :begin
      get '/begin_:code.png', action: :begin_pixel
      get :finish, action: :finish_current
      get '/finish/:code', action: :finish
      get '/finish_:code.png', action: :finish_pixel
    end
  end
end
```
- `HocLegacy::API_ROOT_PATH` sets the mount path (value not in this file — a Ruby constant in the engine).
- `GET/PATCH .../certificates/:session_id -> hoc_legacy/certificates#show/update` — legacy Hour of Code certificate retrieval (student, public)
- `GET .../begin/:code`, `.../begin_:code.png -> hoc_legacy/tutorials#begin/begin_pixel` — legacy HoC tutorial-start tracking, `.png` variant is a tracking-pixel form for email/embed contexts
- `GET .../finish`, `.../finish/:code`, `.../finish_:code.png -> hoc_legacy/tutorials#finish_current/finish/finish_pixel` — same pattern for tutorial completion

---

## Guard/filter expression tally

Counted across the ~40 controllers grepped (`before_action`/`load_and_authorize_resource`/
`authorize!`/`check_authorization`/`require_admin`/`require_levelbuilder_mode`/
`require_teacher`/`skip_before_action`), plus the two route-level `rack_env?` guards and the
one route-level `constraints host:` family. Not a repo-wide count — scoped to the controllers
actually inspected for this catalog (see task's "top ~40" list).

| Expression | Count | Where / meaning |
|---|---|---|
| `before_action :authenticate_user!` (bare or with only/except) | 13 | projects, levels, scripts(+ variants below), admin_reports, admin_users, code_reviews, courses, admin_pilots, ai_lesson_summaries, backpacks, datasets, notifications, user_preferences, dcdo, dynamic_config, feature_mode, gatekeeper — Devise session check |
| `load_and_authorize_resource` (bare or scoped) | 8 | sections, levels, teacher_dashboard, peer_reviews, level_sources, lessons, regional_partners, rubrics, scripts (Unit only) — CanCan auto-authorize on the resource |
| `authorize!` (explicit, ad hoc, inside an action rather than a filter) | ~20 call sites | projects, levels, scripts, courses, script_levels(x7), level_sources(x3), code_reviews(x3), feature_mode(x2), gatekeeper(x3), dcdo(x2), dynamic_config, application_controller's `require_admin`/`authorize_teacher!` helpers |
| `check_authorization` (CanCan: fail if no authorize! ran) | 6 | admin_reports, admin_pilots, courses, scripts, script_levels, code_reviews, level_sources |
| `before_action :require_admin` | 3 | admin_reports, admin_users, admin_pilots — all resolve to `authorize! :read, :reports` |
| `require_levelbuilder_mode` (bare) | 1 controller + 1 explicit call | scripts_controller (explicit call inside an action); helper checks `Rails.application.config.levelbuilder_mode` |
| `require_levelbuilder_mode_or_test_env` | 6 | levels, scripts, courses, lessons, rubrics, data_docs, datasets(uses `require_levelbuilder_mode` not the `_or_test_env` variant) — helper checks `Rails.application.config.levelbuilder_mode \|\| rack_env?(:test)` |
| `skip_before_action :verify_authenticity_token` | 4 | sections (`only: [:archive_all]`), home (`only: 'set_locale'`), registrations (`only: [:set_student_information]`), lti_v1 (bare, all actions) |
| `skip_before_action` (other, session/statsig/etc.) | 4 | home (x3: clear_sign_up_session_vars, initialize_statsig_stable_id), omniauth_callbacks (clear_sign_up_session_vars) |
| `before_action :redirect_admin_from_labs` | 2 | projects, script_levels |
| `if rack_env?(:development, :test)` (route-level) | 1 | wraps `/api/test/*` |
| `if rack_env?(:staging, :test)` (route-level) | 1 | wraps `/api/dev/*` |
| `constraints host: ...` (route-level, preview/codeprojects host gating) | 3 | pyodide-sandbox host, generic preview host, codeprojects apex host, plus the file-wide "anything else" constraint wrapping almost everything |
| No controller-level auth filter at all | 2 | sessions_controller (relies on Devise base class), aichat_requests_controller (only a model-customization filter, no `authenticate_user!`) |

`require_admin` and every direct `authorize! :read, :reports` call are the same CanCan
ability check — "admin" in `/admin/*` means whatever `Ability` grants `:read, :reports` to
(not inspected further here; likely `user.admin?`, not read from routes.rb).
