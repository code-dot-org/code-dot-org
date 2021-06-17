# For documentation see, e.g., http://guides.rubyonrails.org/routing.html.

Dashboard::Application.routes.draw do
  # Override Error Codes
  get "404", to: "application#render_404", via: :all

  # React-router will handle sub-routes on the client.
  get 'teacher_dashboard/sections/:section_id/parent_letter', to: 'teacher_dashboard#parent_letter'
  get 'teacher_dashboard/sections/:section_id/*path', to: 'teacher_dashboard#show', via: :all
  get 'teacher_dashboard/sections/:section_id', to: 'teacher_dashboard#show'

  resources :survey_results, only: [:create], defaults: {format: 'json'}

  resource :pairing, only: [:show, :update]

  resources :user_levels, only: [:update, :destroy]

  patch '/api/v1/user_scripts/:script_id', to: 'api/v1/user_scripts#update'

  get '/download/:product', to: 'hoc_download#index'

  get '/terms-and-privacy', to: 'home#terms_and_privacy'
  get '/dashboardapi/terms-and-privacy', to: "home#terms_and_privacy"
  get '/dashboardapi/hoc-courses-teacher-guides', to: "home#hoc_courses_teacher_guides"
  get '/dashboardapi/hoc-courses-challenge', to: "home#hoc_courses_challenge"

  get "/home", to: "home#home"

  get "/congrats", to: "congrats#index"

  resources :activity_hints, only: [:update]

  resources :hint_view_requests, only: [:create]
  resources :authored_hint_view_requests, only: [:create]

  resources :puzzle_ratings, only: [:create]
  resources :callouts
  resources :videos do
    collection do
      get 'test'
      get 'embed/:key', to: 'videos#embed', as: 'embed'
    end
  end

  get 'maker/home', to: 'maker#home'
  get 'maker/setup', to: 'maker#setup'
  get 'maker/discountcode', to: 'maker#discountcode'
  post 'maker/apply', to: 'maker#apply'
  post 'maker/schoolchoice', to: 'maker#schoolchoice'
  post 'maker/complete', to: 'maker#complete'
  get 'maker/application_status', to: 'maker#application_status'
  post 'maker/override', to: 'maker#override'
  get 'maker/google_oauth_login_code', to: 'maker#login_code'
  get 'maker/display_google_oauth_code', to: 'maker#display_code'
  get 'maker/google_oauth_confirm_login', to: 'maker#confirm_login'

  # Media proxying
  get 'media', to: 'media_proxy#get', format: false

  # XHR proxying
  get 'xhr', to: 'xhr_proxy#get', format: false

  get 'redirected_url', to: 'redirect_proxy#get', format: false

  get 'docs/', to: 'curriculum_proxy#get_doc_landing'
  get 'docs/*path', to: 'curriculum_proxy#get_doc'
  get 'curriculum/*path', to: 'curriculum_proxy#get_curriculum'

  # User-facing section routes
  resources :sections, only: [:show] do
    member do
      post 'log_in'
    end
  end
  # Section API routes (JSON only)
  concern :section_api_routes do
    resources :sections, only: [:index, :show, :create, :update, :destroy] do
      resources :students, only: [:index, :update], controller: 'sections_students' do
        collection do
          post 'bulk_add'
          get 'completed_levels_count'
        end
        member do
          post 'remove'
        end
      end
      member do
        post 'join'
        post 'leave'
        post 'update_sharing_disabled'
        get 'student_script_ids'
      end
      collection do
        get 'membership'
        get 'valid_scripts'
        get 'require_captcha'
      end
    end
  end

  # Used in react assessments tab
  concern :assessments_routes do
    resources :assessments, only: [:index] do
      collection do
        get 'section_responses'
        get 'section_surveys'
        get 'section_feedback'
      end
    end
  end

  post '/dashboardapi/sections/transfers', to: 'transfers#create'
  post '/api/sections/transfers', to: 'transfers#create'

  get '/sh/:id', to: redirect('/c/%{id}')
  get '/sh/:id/:action_id', to: redirect('/c/%{id}/%{action_id}')

  get '/u/:id', to: redirect('/c/%{id}')
  get '/u/:id/:action_id', to: redirect('/c/%{id}/%{action_id}')

  # These links should no longer be created (August 2017), though we will continue to support
  # existing links. Instead, create /r/ links.
  resources :level_sources, path: '/c/', only: [:show, :edit, :update] do
    member do
      get 'generate_image'
      get 'original_image'
    end
  end
  # These routes are being created to replace the /c/ routes (August 2017) so as to include the ID
  # of the sharing user in the URL. Doing so allows us to block showing the level source if the user
  # deletes themself.
  resources :obfuscated_level_sources, path: '/r/', controller: :level_sources, param: :level_source_id_and_user_id, only: [:show, :edit, :update] do
    member do
      get 'generate_image'
      get 'original_image'
    end
  end

  get '/share/:id', to: redirect('/c/%{id}')

  devise_scope :user do
    get '/oauth_sign_out/:provider', to: 'sessions#oauth_sign_out', as: :oauth_sign_out
    post '/users/begin_sign_up', to: 'registrations#begin_sign_up'
    patch '/dashboardapi/users', to: 'registrations#update'
    patch '/users/upgrade', to: 'registrations#upgrade'
    patch '/users/set_age', to: 'registrations#set_age'
    patch '/users/email', to: 'registrations#set_email'
    patch '/users/parent_email', to: 'registrations#set_parent_email'
    patch '/users/user_type', to: 'registrations#set_user_type'
    get '/users/cancel', to: 'registrations#cancel'
    post '/users/auth/:id/disconnect', to: 'authentication_options#disconnect'
    get '/users/migrate_to_multi_auth', to: 'registrations#migrate_to_multi_auth'
    get '/users/demigrate_from_multi_auth', to: 'registrations#demigrate_from_multi_auth'
    get '/users/to_destroy', to: 'registrations#users_to_destroy'
    get '/reset_session', to: 'sessions#reset'
    get '/users/existing_account', to: 'registrations#existing_account'
    post '/users/auth/maker_google_oauth2', to: 'omniauth_callbacks#maker_google_oauth2'
  end
  devise_for :users, controllers: {
    omniauth_callbacks: 'omniauth_callbacks',
    registrations: 'registrations',
    confirmations: 'confirmations',
    sessions: 'sessions',
    passwords: 'passwords'
  }
  get 'discourse/sso' => 'discourse_sso#sso'
  post '/auth/lti', to: 'lti_provider#sso'

  root to: "home#index"
  get '/home_insert', to: 'home#home_insert'
  get '/health_check', to: 'home#health_check'
  namespace :home do
    HomeController.instance_methods(false).each do |action|
      get action, action: action
    end
  end

  resources :p, path: '/p/', only: [:index] do
    collection do
      ProjectsController::STANDALONE_PROJECTS.each do |key, value|
        get '/' + key.to_s, to: 'projects#redirect_legacy', key: value[:name], as: key.to_s
      end
      get '/', to: redirect('/projects')
    end
  end

  get "/gallery", to: redirect("/projects/public")

  get 'projects/featured', to: 'projects#featured'
  put '/featured_projects/:project_id/unfeature', to: 'featured_projects#unfeature'
  put '/featured_projects/:project_id/feature', to: 'featured_projects#feature'

  resources :projects, path: '/projects/', only: [:index] do
    collection do
      ProjectsController::STANDALONE_PROJECTS.each do |key, _|
        get "/#{key}", to: 'projects#load', key: key.to_s, as: "#{key}_project"
        get "/#{key}/new", to: 'projects#create_new', key: key.to_s, as: "#{key}_project_create_new"
        get "/#{key}/:channel_id", to: 'projects#show', key: key.to_s, as: "#{key}_project_share", share: true
        get "/#{key}/:channel_id/edit", to: 'projects#edit', key: key.to_s, as: "#{key}_project_edit"
        get "/#{key}/:channel_id/view", to: 'projects#show', key: key.to_s, as: "#{key}_project_view", readonly: true
        get "/#{key}/:channel_id/embed", to: 'projects#show', key: key.to_s, as: "#{key}_project_iframe_embed", iframe_embed: true

        # appending 'embed_app_and_code' to a project renders a page with just the app editor. It is distinct from appending 'embed'
        # to a project in that appending 'embed' renders only the app, wheras 'embed_app_and_code renders the app and the workspace
        # for building the app, in view only mode. Specifically, appending 'embed_app_and_code' to a project does the following:
        #
        # - set view options to remove headers/footers
        # - set a view option 'iframeEmbedAppAndCode' to true, setting the config.level.iframeEmbedAppAndCode variable to true on the client side
        #   This makes a number of changes to how StudioApp behaves, and some changes to how P5Lab.js behaves
        get "/#{key}/:channel_id/embed_app_and_code", to: 'projects#show', key: key.to_s, as: "#{key}_project_iframe_embed_app_and_code", iframe_embed_app_and_code: true, readonly: true
        get "/#{key}/:channel_id/remix", to: 'projects#remix', key: key.to_s, as: "#{key}_project_remix"
        get "/#{key}/:channel_id/export_create_channel", to: 'projects#export_create_channel', key: key.to_s, as: "#{key}_project_export_create_channel"
        get "/#{key}/:channel_id/export_config", to: 'projects#export_config', key: key.to_s, as: "#{key}_project_export_config"
      end

      get '/:tab_name', to: 'projects#index', constraints: {tab_name: /(public|libraries)/}
    end
  end

  post '/locale', to: 'home#set_locale', as: 'locale'

  # quick links for cartoon network arabic
  get '/flappy/lang/ar', to: 'home#set_locale', as: 'flappy/lang/ar', locale: 'ar-SA', user_return_to: '/flappy/1'
  get '/playlab/lang/ar', to: 'home#set_locale', as: 'playlab/lang/ar', locale: 'ar-SA', user_return_to: '/s/playlab/lessons/1/levels/1'
  get '/artist/lang/ar', to: 'home#set_locale', as: 'artist/lang/ar', locale: 'ar-SA', user_return_to: '/s/artist/lessons/1/levels/1'

  # /lang/xx shortcut for all routes
  get '/lang/:locale', to: 'home#set_locale', user_return_to: '/'
  get '*i18npath/lang/:locale', to: 'home#set_locale'

  get 'pools', to: 'pools#index', as: 'pools'
  scope 'pools/:pool' do
    resources :blocks, constraints: {id: /[^\/]+/}
  end
  resources :shared_blockly_functions, path: '/functions'

  resources :libraries do
    collection do
      get '/get_updates', to: 'libraries#get_updates'
    end
  end

  resources :datasets, param: 'dataset_name', constraints: {dataset_name: /[^\/]+/}, only: [:index, :show, :update, :destroy] do
    collection do
      get '/manifest/edit', to: 'datasets#edit_manifest'
      post '/manifest/update', to: 'datasets#update_manifest'
    end
  end

  resources :levels do
    collection do
      get 'get_filtered_levels'
    end
    member do
      get 'get_rubric'
      get 'embed_level'
      get 'edit_blocks/:type', to: 'levels#edit_blocks', as: 'edit_blocks'
      get 'get_serialized_maze'
      post 'update_properties'
      post 'update_blocks/:type', to: 'levels#update_blocks', as: 'update_blocks'
      post 'clone'
    end
  end

  post 'level_assets/upload', to: 'level_assets#upload'

  resources :level_starter_assets, only: [:show], param: 'level_name', constraints: {level_name: /[^\/]+/} do
    member do
      get '/:filename', to: 'level_starter_assets#file', format: true
      post '', to: 'level_starter_assets#upload'
      delete '/:filename', to: 'level_starter_assets#destroy'
    end
  end

  get '/course/:course_name', to: redirect('/courses/%{course_name}')
  get '/courses/:course_name/vocab/edit', to: 'vocabularies#edit'

  resources :courses, param: 'course_name' do
    member do
      get 'vocab'
      get 'resources'
      get 'code'
      get 'standards'
      get 'get_rollup_resources'
    end
  end

  # CSP 20-21 lockable lessons with lesson plan redirects
  get '/s/csp1-2020/lockable/2(*all)', to: redirect(path: '/s/csp1-2020/lessons/14%{all}')
  get '/s/csp2-2020/lockable/1(*all)', to: redirect(path: '/s/csp2-2020/lessons/9%{all}')
  get '/s/csp3-2020/lockable/1(*all)', to: redirect(path: '/s/csp3-2020/lessons/11%{all}')
  get '/s/csp4-2020/lockable/1(*all)', to: redirect(path: '/s/csp4-2020/lessons/15%{all}')
  get '/s/csp5-2020/lockable/1(*all)', to: redirect(path: '/s/csp5-2020/lessons/18%{all}')
  get '/s/csp6-2020/lockable/1(*all)', to: redirect(path: '/s/csp6-2020/lessons/6%{all}')
  get '/s/csp7-2020/lockable/1(*all)', to: redirect(path: '/s/csp7-2020/lessons/11%{all}')
  get '/s/csp9-2020/lockable/1(*all)', to: redirect(path: '/s/csp9-2020/lessons/9%{all}')
  get '/s/csp10-2020/lockable/1(*all)', to: redirect(path: '/s/csp10-2020/lessons/14%{all}')

  resources :lessons, only: [:edit, :update] do
    member do
      post :clone
    end
  end

  resources :resources, only: [:create, :update] do
    collection do
      get :search
    end
  end

  resources :vocabularies, only: [:create, :update] do
    collection do
      get :search
    end
  end

  resources :programming_expressions, only: [] do
    collection do
      get :search
    end
  end

  resources :standards, only: [] do
    collection do
      get :search
    end
  end

  # Redirects from old /stage/x/extras url to new /lessons/x/extras url
  get '/s/:script_name/stage/:position/extras', to: redirect(path: '/s/%{script_name}/lessons/%{position}/extras')

  # Redirects from old /stage/x/puzzle url to new /lessons/x/levels url
  get '/s/:script_name/stage/:position/puzzle/(*all)', to: redirect(path: '/s/%{script_name}/lessons/%{position}/levels/%{all}')

  # Redirects from old /lockable/x/puzzle url to new /lockable/x/levels url
  get '/s/:script_name/lockable/:position/puzzle/(*all)', to: redirect(path: '/s/%{script_name}/lockable/%{position}/levels/%{all}')

  resources :scripts, path: '/s/' do
    # /s/xxx/reset
    get 'reset', to: 'script_levels#reset'
    get 'next', to: 'script_levels#next'
    get 'hidden_lessons', to: 'script_levels#hidden_lesson_ids'
    get 'hidden_stages', to: 'script_levels#hidden_lesson_ids' #TODO: Remove once launched
    post 'toggle_hidden', to: 'script_levels#toggle_hidden'

    member do
      get 'vocab'
      get 'resources'
      get 'code'
      get 'standards'
      get 'instructions'
      get 'get_rollup_resources'
    end

    # /s/xxx/lessons/yyy
    resources :lessons, only: [:show], param: 'position', format: false do
      get 'student', to: 'lessons#student_lesson_plan'
      get 'extras', to: 'script_levels#lesson_extras', format: false
      get 'summary_for_lesson_plans', to: 'script_levels#summary_for_lesson_plans', format: false
      get 'edit', to: 'lessons#edit'

      # /s/xxx/lessons/yyy/levels/zzz
      resources :script_levels, only: [:show], path: "/levels", format: false do
        member do
          # /s/xxx/lessons/yyy/levels/zzz/page/ppp
          get 'page/:puzzle_page', to: 'script_levels#show', as: 'puzzle_page', format: false
          # /s/xxx/lessons/yyy/levels/zzz/sublevel/sss
          get 'sublevel/:sublevel_position', to: 'script_levels#show', as: 'sublevel', format: false
        end
      end
    end

    # /s/xxx/lockable/yyy/levels/zzz
    resources :lockable_lessons, only: [], path: "/lockable", param: 'position', format: false do
      get 'summary_for_lesson_plans', to: 'script_levels#summary_for_lesson_plans', format: false
      resources :script_levels, only: [:show], path: "/levels", format: false do
        member do
          # /s/xxx/lockable/yyy/levels/zzz/page/ppp
          get 'page/:puzzle_page', to: 'script_levels#show', as: 'puzzle_page', format: false
        end
      end
    end

    get 'preview-assignments', to: 'plc/enrollment_evaluations#preview_assignments', as: 'preview_assignments'
    post 'confirm_assignments', to: 'plc/enrollment_evaluations#confirm_assignments', as: 'confirm_assignments'

    get 'pull-review', to: 'peer_reviews#pull_review', as: 'pull_review'
  end

  get '/beta', to: redirect('/')

  get '/hoc/reset', to: 'script_levels#reset', script_id: Script::HOC_NAME, as: 'hoc_reset'
  get '/hoc/:chapter', to: 'script_levels#show', script_id: Script::HOC_NAME, as: 'hoc_chapter', format: false

  get '/flappy/:chapter', to: 'script_levels#show', script_id: Script::FLAPPY_NAME, as: 'flappy_chapter', format: false
  get '/jigsaw/:chapter', to: 'script_levels#show', script_id: Script::JIGSAW_NAME, as: 'jigsaw_chapter', format: false

  get '/weblab/host', to: 'weblab_host#index'

  get '/join(/:section_code)', to: 'followers#student_user_new', as: 'student_user_new'
  post '/join(/:section_code)', to: 'followers#student_register', as: 'student_register'

  post '/milestone/:user_id/level/:level_id', to: 'activities#milestone', as: 'milestone_level'
  post '/milestone/:user_id/:script_level_id', to: 'activities#milestone', as: 'milestone'
  post '/milestone/:user_id/:script_level_id/:level_id', to: 'activities#milestone', as: 'milestone_script_level'

  get '/admin', to: 'admin_reports#directory', as: 'admin_directory'
  resources :regional_partners
  post 'regional_partners/:id/assign_program_manager', controller: 'regional_partners', action: 'assign_program_manager'
  get 'regional_partners/:id/remove_program_manager/:program_manager_id', controller: 'regional_partners', action: 'remove_program_manager'
  post 'regional_partners/:id/add_mapping', controller: 'regional_partners', action: 'add_mapping'
  get 'regional_partners/:id/remove_mapping/:id', controller: 'regional_partners', action: 'remove_mapping'
  post 'regional_partners/:id/replace_mappings',  controller: 'regional_partners', action: 'replace_mappings'

  # HOC dashboards.
  get '/admin/hoc/students_served', to: 'admin_hoc#students_served', as: 'hoc_students_served'

  # internal report dashboards
  get '/admin/levels', to: 'admin_reports#level_completions', as: 'level_completions'
  get '/admin/level_answers(.:format)', to: 'admin_reports#level_answers', as: 'level_answers'
  get '/admin/pd_progress(/:script)', to: 'admin_reports#pd_progress', as: 'pd_progress'
  get '/admin/debug', to: 'admin_reports#debug'

  # internal search tools
  get '/admin/find_students', to: 'admin_search#find_students', as: 'find_students'
  get '/admin/lookup_section', to: 'admin_search#lookup_section', as: 'lookup_section'
  post '/admin/lookup_section', to: 'admin_search#lookup_section'
  post '/admin/undelete_section', to: 'admin_search#undelete_section', as: 'undelete_section'
  get '/admin/pilots/', to: 'admin_search#pilots', as: 'pilots'
  post '/admin/pilots/', to: 'admin_search#create_pilot', as: 'create_pilot'
  get '/admin/pilots/:pilot_name', to: 'admin_search#show_pilot', as: 'show_pilot'
  post '/admin/add_to_pilot', to: 'admin_search#add_to_pilot', as: 'add_to_pilot'

  # internal engineering dashboards
  get '/admin/dynamic_config', to: 'dynamic_config#show', as: 'dynamic_config_state'
  get '/admin/feature_mode', to: 'feature_mode#show', as: 'feature_mode'
  post '/admin/feature_mode', to: 'feature_mode#update', as: 'feature_mode_update'

  # internal support tools
  get '/admin/account_repair', to: 'admin_users#account_repair_form', as: 'account_repair_form'
  post '/admin/account_repair', to: 'admin_users#account_repair',  as: 'account_repair'
  get '/admin/assume_identity', to: 'admin_users#assume_identity_form', as: 'assume_identity_form'
  post '/admin/assume_identity', to: 'admin_users#assume_identity', as: 'assume_identity'
  post '/admin/undelete_user', to: 'admin_users#undelete_user', as: 'undelete_user'
  get '/admin/manual_pass', to: 'admin_users#manual_pass_form', as: 'manual_pass_form'
  post '/admin/manual_pass', to: 'admin_users#manual_pass', as: 'manual_pass'
  get '/admin/permissions', to: 'admin_users#permissions_form', as: 'permissions_form'
  post '/admin/grant_permission', to: 'admin_users#grant_permission', as: 'grant_permission'
  get '/admin/revoke_permission', to: 'admin_users#revoke_permission', as: 'revoke_permission'
  post '/admin/bulk_grant_permission', to: 'admin_users#bulk_grant_permission', as: 'bulk_grant_permission'
  get '/admin/studio_person', to: 'admin_users#studio_person_form', as: 'studio_person_form'
  post '/admin/studio_person_merge', to: 'admin_users#studio_person_merge', as: 'studio_person_merge'
  post '/admin/studio_person_split', to: 'admin_users#studio_person_split', as: 'studio_person_split'
  post '/admin/studio_person_add_email_to_emails', to: 'admin_users#studio_person_add_email_to_emails', as: 'studio_person_add_email_to_emails'
  get '/census/review', to: 'census_reviewers#review_reported_inaccuracies', as: 'review_reported_inaccuracies'
  post '/census/review', to: 'census_reviewers#create'

  get '/admin/styleguide', to: redirect('/styleguide/')

  get '/admin/gatekeeper', to: 'dynamic_config#gatekeeper_show', as: 'gatekeeper_show'
  post '/admin/gatekeeper/delete', to: 'dynamic_config#gatekeeper_delete', as: 'gatekeeper_delete'
  post '/admin/gatekeeper/set', to: 'dynamic_config#gatekeeper_set', as: 'gatekeeper_set'
  get '/admin/standards', to: 'admin_standards#index', as: 'admin_standards_index'
  post '/admin/standards', to: 'admin_standards#import_standards', as: 'admin_standards_import'

  get '/notes/:key', to: 'notes#index'

  resources :zendesk_session, only: [:index]

  post '/report_abuse', to: 'report_abuse#report_abuse'
  get '/report_abuse', to: 'report_abuse#report_abuse_form'

  get '/too_young', to: 'too_young#index'

  post '/sms/send', to: 'sms#send_to_phone', as: 'send_to_phone'
  post '/sms/send_download', to: 'sms#send_download_url_to_phone', as: 'send_download_url_to_phone'

  # Experiments are get requests so that a user can click on a link to join or leave an experiment
  get '/experiments/set_course_experiment/:experiment_name', to: 'experiments#set_course_experiment'
  get '/experiments/set_single_user_experiment/:experiment_name', to: 'experiments#set_single_user_experiment'
  get '/experiments/disable_single_user_experiment/:experiment_name', to: 'experiments#disable_single_user_experiment'

  get '/peer_reviews/dashboard', to: 'peer_reviews#dashboard'
  resources :peer_reviews

  get '/plc/user_course_enrollments/group_view', to: 'plc/user_course_enrollments#group_view'
  get '/plc/user_course_enrollments/manager_view/:id', to: 'plc/user_course_enrollments#manager_view', as: 'plc_user_course_enrollment_manager_view'

  namespace :plc do
    root to: 'plc#index'
    resources :user_course_enrollments
    resources :course_units, only: [] do
      collection do
        get :launch
        post :launch_plc_course
      end
    end
  end

  concern :api_v1_pd_routes do
    namespace :pd do
      resources :workshops do
        collection do
          get :filter
          get :upcoming_teachercons
        end
        member do # See http://guides.rubyonrails.org/routing.html#adding-more-restful-actions
          post :start
          post :unstart
          post :end
          post :reopen
          get  :summary
          get  :potential_organizers
        end
        resources :enrollments, controller: 'workshop_enrollments', only: [:index, :destroy, :create]

        get :attendance, action: 'index', controller: 'workshop_attendance'
        get 'attendance/:session_id', action: 'show', controller: 'workshop_attendance'
        put 'attendance/:session_id/user/:user_id', action: 'create', controller: 'workshop_attendance'
        delete 'attendance/:session_id/user/:user_id', action: 'destroy', controller: 'workshop_attendance'
        put 'attendance/:session_id/enrollment/:enrollment_id', action: 'create_by_enrollment', controller: 'workshop_attendance'
        delete 'attendance/:session_id/enrollment/:enrollment_id', action: 'destroy_by_enrollment', controller: 'workshop_attendance'

        get :workshop_survey_report, action: :workshop_survey_report, controller: 'workshop_survey_report'
        get :local_workshop_survey_report, action: :local_workshop_survey_report, controller: 'workshop_survey_report'
        get :generic_survey_report, action: :generic_survey_report, controller: 'workshop_survey_report'
        get :experiment_survey_report, action: :experiment_survey_report, controller: 'workshop_survey_report'
        get :teachercon_survey_report, action: :teachercon_survey_report, controller: 'workshop_survey_report'
        get :workshop_organizer_survey_report, action: :workshop_organizer_survey_report, controller: 'workshop_organizer_survey_report'

        get 'foorm/generic_survey_report', action: :generic_survey_report, controller: 'workshop_survey_foorm_report'
        get 'foorm/csv_survey_report', action: :csv_survey_report, controller: 'workshop_survey_foorm_report'
        get 'foorm/forms_for_workshop', action: :forms_for_workshop, controller: 'workshop_survey_foorm_report'
      end

      resources :workshop_summary_report, only: :index
      resources :teacher_attendance_report, only: :index
      resources :course_facilitators, only: :index
      resources :workshop_organizers, only: :index
      delete 'enrollments/:enrollment_code', action: 'cancel', controller: 'workshop_enrollments'
      post 'enrollment/:enrollment_id/scholarship_info', action: 'update_scholarship_info', controller: 'workshop_enrollments'
      post 'enrollments/move', action: 'move', controller: 'workshop_enrollments'
      post 'enrollment/:id/edit', action: 'edit', controller: 'workshop_enrollments'
      get 'legacy_survey_summaries', action: :legacy_survey_summaries, controller: 'legacy_survey_summaries'

      # persistent namespace for FiT Weekend registrations, can be updated/replaced each year
      post 'fit_weekend_registrations', to: 'fit_weekend_registrations#create'

      post :pre_workshop_surveys, to: 'pre_workshop_surveys#create'
      post :workshop_surveys, to: 'workshop_surveys#create'
      post :teachercon_surveys, to: 'teachercon_surveys#create'
      post :regional_partner_mini_contacts, to: 'regional_partner_mini_contacts#create'
      post :international_opt_ins, to: 'international_opt_ins#create'
      get :regional_partner_workshops, to: 'regional_partner_workshops#index'
      get 'regional_partner_workshops/find', to: 'regional_partner_workshops#find'
      get 'regional_partners/find', to: 'regional_partners#find'

      post 'foorm/workshop_survey_submission', action: :create, controller: 'workshop_survey_foorm_submissions'

      namespace :application do
        post :facilitator, to: 'facilitator_applications#create'

        resources :teacher, controller: 'teacher_applications', only: :create do
          member do
            post :send_principal_approval
            post :principal_approval_not_required
          end
        end
        post :principal_approval, to: 'principal_approval_applications#create'
      end

      resources :applications, controller: 'applications', only: [:index, :show, :update, :destroy] do
        collection do
          get :quick_view
          get :cohort_view
          get :search
          get :fit_cohort
        end
      end

      namespace :foorm do
        namespace :forms do
          post 'form_with_library_items', action: :fill_in_library_items
          get 'submissions_csv', action: :get_submissions_as_csv
          get 'form_names', action: :get_form_names_and_versions
          post :validate_form
          get ':id', action: :get_form_data
        end
        namespace :library_questions do
          post :validate_library_question
        end
      end
    end
  end

  get '/dashboardapi/v1/regional_partners/find', to: 'api/v1/regional_partners#find'
  get '/dashboardapi/v1/regional_partners/show/:partner_id', to: 'api/v1/regional_partners#show'
  post '/dashboardapi/v1/pd/regional_partner_mini_contacts', to: 'api/v1/pd/regional_partner_mini_contacts#create'
  post '/dashboardapi/v1/amazon_future_engineer_submit', to: 'api/v1/amazon_future_engineer#submit'

  post '/dashboardapi/v1/foorm/simple_survey_submission', action: :create, controller: 'api/v1/foorm_simple_survey_submissions'

  get 'my-professional-learning', to: 'pd/professional_learning_landing#index', as: 'professional_learning_landing'

  namespace :pd do
    # React-router will handle sub-routes on the client.
    get 'workshop_dashboard/*path', to: 'workshop_dashboard#index'
    get 'workshop_dashboard', to: 'workshop_dashboard#index'

    get 'misc_survey/thanks', to: 'misc_survey#thanks'
    get 'misc_survey/:form_tag', to: 'misc_survey#new'
    post 'misc_survey/submit', to: 'misc_survey#submit'

    get 'workshop_survey/day/:day', to: 'workshop_daily_survey#new_general'
    get 'workshop_daily_survey/day/:day', to: 'workshop_daily_survey#new_daily_foorm'
    get 'workshop_pre_survey', to: 'workshop_daily_survey#new_pre_foorm'
    get 'workshop_post_survey', to: 'workshop_daily_survey#new_post_foorm'
    post 'workshop_survey/submit', to: 'workshop_daily_survey#submit_general'
    get 'workshop_survey/post/:enrollment_code', to: 'workshop_daily_survey#new_post', as: 'new_workshop_survey'
    get 'workshop_survey/facilitators/:session_id(/:facilitator_index)', to: 'workshop_daily_survey#new_facilitator'
    post 'workshop_survey/facilitators/submit', to: 'workshop_daily_survey#submit_facilitator'
    get 'workshop_survey/csf/post101(/:enrollment_code)', to: 'workshop_daily_survey#new_csf_post101'
    get 'workshop_survey/csf/pre201', to: 'workshop_daily_survey#new_csf_pre201'
    get 'workshop_survey/csf/post201(/:enrollment_code)', to: 'workshop_daily_survey#new_csf_post201'
    get 'workshop_survey/foorm/csf/post201(/:enrollment_code)', to: 'workshop_daily_survey#new_csf_post201_foorm'
    get 'workshop_survey/foorm/csf/pre201', to: 'workshop_daily_survey#new_csf_pre201_foorm'
    get 'workshop_survey/thanks', to: 'workshop_daily_survey#thanks'

    get 'post_course_survey/thanks', to: 'post_course_survey#thanks'
    post 'post_course_survey/submit', to: 'post_course_survey#submit'
    get 'post_course_survey/:course_initials', to: 'post_course_survey#new'

    # Academic year workshops
    get '/:workshop_subject/pre/(*agenda)', to: 'workshop_daily_survey#new_ayw_pre',
        constraints: {agenda: /module\/[0-9_]+/}
    get '/:workshop_subject/day/:day', to: 'workshop_daily_survey#new_ayw_daily',
        constraints: {day: /\d/}
    get '/:workshop_subject/post/(*agenda)', to: 'workshop_daily_survey#new_ayw_post',
        constraints: {agenda: /(module\/[0-9_]+)|(in_person)/}

    namespace :application do
      get 'facilitator', to: 'facilitator_application#new'
      get 'teacher', to: 'teacher_application#new'
      get 'principal_approval/:application_guid', to: 'principal_approval_application#new', as: 'principal_approval'
    end

    # persistent namespace for Teachercon and FiT Weekend registrations, can be updated/replaced each year
    get 'fit_weekend_registration/:application_guid', to: 'fit_weekend_registration#new'

    delete 'fit_weekend_registration/:application_guid', to: 'fit_weekend_registration#destroy'

    get 'workshops/:workshop_id/enroll', action: 'new', controller: 'workshop_enrollment'
    post 'workshops/:workshop_id/enroll', action: 'create', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code', action: 'show', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code/thanks', action: 'thanks', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code/cancel', action: 'cancel', controller: 'workshop_enrollment'

    get 'pre_workshop_survey/:enrollment_code', action: 'new', controller: 'pre_workshop_survey', as: 'new_pre_workshop_survey'
    get 'teachercon_survey/:enrollment_code', action: 'new', controller: 'teachercon_survey', as: 'new_teachercon_survey'

    get 'generate_workshop_certificate/:enrollment_code', controller: 'workshop_certificate', action: 'generate_certificate'

    get 'attend/:session_code', controller: 'session_attendance', action: 'attend'
    post 'attend/:session_code', controller: 'session_attendance', action: 'select_enrollment'
    get 'attend/:session_code/join', controller: 'workshop_enrollment', action: 'join_session'
    post 'attend/:session_code/join', controller: 'workshop_enrollment', action: 'confirm_join_session'
    get 'attend/:session_code/upgrade', controller: 'session_attendance', action: 'upgrade_account'
    post 'attend/:session_code/upgrade', controller: 'session_attendance', action: 'confirm_upgrade_account'

    get 'workshop_admins', controller: 'workshop_admins', action: 'directory', as: 'workshop_admins'
    get 'workshop_user_management/facilitator_courses', controller: 'workshop_user_management', action: 'facilitator_courses_form', as: 'facilitator_courses'
    post 'workshop_user_management/assign_course', controller: 'workshop_user_management', action: 'assign_course_to_facilitator'
    # TODO: change remove_course to use http delete method
    get 'workshop_user_management/remove_course', controller: 'workshop_user_management', action: 'remove_course_from_facilitator'

    get 'regional_partner_contact/new', to: 'regional_partner_contact#new'
    get 'regional_partner_mini_contact/new', to: 'regional_partner_mini_contact#new'

    get 'international_workshop', to: 'international_opt_in#new'
    get 'international_workshop/:contact_id/thanks', to: 'international_opt_in#thanks'

    # React-router will handle sub-routes on the client.
    get 'application_dashboard/*path', to: 'application_dashboard#index'
    get 'application_dashboard', to: 'application_dashboard#index'
  end

  get '/dashboardapi/section_progress/:section_id', to: 'api#section_progress'
  get '/dashboardapi/section_text_responses/:section_id', to: 'api#section_text_responses'
  scope 'dashboardapi', module: 'api/v1' do
    concerns :section_api_routes
    concerns :assessments_routes
  end

  # Wildcard routes for API controller: select all public instance methods in the controller,
  # and all template names in `app/views/api/*`.
  api_methods = (ApiController.instance_methods(false) +
    Dir.glob(File.join(Rails.application.config.paths['app/views'].first, 'api/*')).map do |file|
      File.basename(file).to_s.gsub(/\..*$/, '')
    end).uniq

  namespace :dashboardapi, module: :api do
    api_methods.each do |action|
      get action, action: action
    end
  end
  get '/dashboardapi/v1/pd/k5workshops', to: 'api/v1/pd/workshops#k5_public_map_index'
  get '/api/v1/pd/workshops_user_enrolled_in', to: 'api/v1/pd/workshops#workshops_user_enrolled_in'

  post '/api/lock_status', to: 'api#update_lockable_state'
  get '/api/lock_status', to: 'api#lockable_state'
  get '/dashboardapi/script_structure/:script', to: 'api#script_structure'
  get '/api/script_structure/:script', to: 'api#script_structure'
  get '/dashboardapi/script_standards/:script', to: 'api#script_standards'
  get '/api/section_progress/:section_id', to: 'api#section_progress', as: 'section_progress'
  get '/dashboardapi/section_level_progress/:section_id', to: 'api#section_level_progress', as: 'section_level_progress'
  get '/api/user_progress/:script', to: 'api#user_progress', as: 'user_progress'
  get '/api/user_progress/:script/:lesson_position/:level_position', to: 'api#user_progress_for_lesson', as: 'user_progress_for_lesson'
  get '/api/user_progress/:script/:lesson_position/:level_position/:level', to: 'api#user_progress_for_lesson', as: 'user_progress_for_lesson_and_level'
  put '/api/firehose_unreachable', to: 'api#firehose_unreachable'
  namespace :api do
    api_methods.each do |action|
      get action, action: action
    end
  end

  if rack_env?(:development, :test)
    scope '/api' do
      namespace :test, defaults: {format: 'json'} do
        TestController.instance_methods(false).each do |action|
          method = action.to_s.start_with?('get') ? :get : :post
          send(method, action, action: action)
        end
      end
    end
  end

  namespace :api do
    namespace :v1 do
      concerns :api_v1_pd_routes
      concerns :section_api_routes
      post 'users/:user_id/using_text_mode', to: 'users#post_using_text_mode'
      post 'users/:user_id/using_dark_mode', to: 'users#update_using_dark_mode'
      get 'users/:user_id/using_text_mode', to: 'users#get_using_text_mode'
      get 'users/:user_id/using_dark_mode', to: 'users#get_using_dark_mode'
      get 'users/:user_id/contact_details', to: 'users#get_contact_details'
      get 'users/:user_id/school_name', to: 'users#get_school_name'
      get 'users/:user_id/school_donor_name', to: 'users#get_school_donor_name'

      patch 'user_school_infos/:id/update_last_confirmation_date', to: 'user_school_infos#update_last_confirmation_date'

      patch 'user_school_infos', to: 'user_school_infos#update'

      post 'users/:user_id/post_ui_tip_dismissed', to: 'users#post_ui_tip_dismissed'

      post 'users/:user_id/postpone_census_banner', to: 'users#postpone_census_banner'
      post 'users/:user_id/dismiss_census_banner', to: 'users#dismiss_census_banner'
      post 'users/:user_id/dismiss_donor_teacher_banner', to: 'users#dismiss_donor_teacher_banner'
      post 'users/:user_id/dismiss_parent_email_banner', to: 'users#dismiss_parent_email_banner'

      get 'school-districts/:state', to: 'school_districts#index', defaults: {format: 'json'}
      get 'schools/:school_district_id/:school_type', to: 'schools#index', defaults: {format: 'json'}
      get 'schools/:id', to: 'schools#show', defaults: {format: 'json'}
      get 'regional_partners/:school_district_id/:course', to: 'regional_partners#for_school_district_and_course', defaults: {format: 'json'}
      get 'regional_partners', to: 'regional_partners#index', defaults: {format: 'json'}
      get 'regional_partners/capacity', to: 'regional_partners#capacity'
      get 'regional_partners/enrolled', to: 'regional_partners#enrolled'

      get 'projects/gallery/public/:project_type/:limit(/:published_before)', to: 'projects/public_gallery#index', defaults: {format: 'json'}

      get 'projects/personal', to: 'projects/personal_projects#index', defaults: {format: 'json'}
      resources :section_libraries, only: [:index], defaults: {format: 'json'}

      # Routes used by UI test status pages
      get 'test_logs/*prefix/since/:time', to: 'test_logs#get_logs_since', defaults: {format: 'json'}
      get 'test_logs/*prefix/:name', to: 'test_logs#get_log_details', defaults: {format: 'json'}

      # Routes used by the peer reviews admin pages
      get 'peer_review_submissions/index', to: 'peer_review_submissions#index'
      get 'peer_review_submissions/report_csv', to: 'peer_review_submissions#report_csv'

      resources :ml_models, only: [:show, :destroy] do
        collection do
          get 'names'
          post 'save'
        end
      end

      resources :teacher_feedbacks, only: [:index, :create] do
        collection do
          get 'get_feedback_from_teacher'
          get 'get_feedbacks'
          get 'count'
        end
        member do
          post 'increment_visit_count'
        end
      end
    end
  end

  resources :feedback, controller: 'teacher_feedbacks'

  get '/dashboardapi/v1/users/:user_id/contact_details', to: 'api/v1/users#get_contact_details'
  get '/dashboardapi/v1/users/:user_id/donor_teacher_banner_details', to: 'api/v1/users#get_donor_teacher_banner_details'
  get '/dashboardapi/v1/users/:user_id/school_donor_name', to: 'api/v1/users#get_school_donor_name'
  post '/dashboardapi/v1/users/accept_data_transfer_agreement', to: 'api/v1/users#accept_data_transfer_agreement'
  get '/dashboardapi/v1/school-districts/:state', to: 'api/v1/school_districts#index', defaults: {format: 'json'}
  get '/dashboardapi/v1/schools/:id/afe_high_needs', to: 'api/v1/schools#afe_high_needs', defaults: {format: 'json'}
  get '/dashboardapi/v1/schools/:school_district_id/:school_type', to: 'api/v1/schools#index', defaults: {format: 'json'}
  get '/dashboardapi/v1/schools/:id', to: 'api/v1/schools#show', defaults: {format: 'json'}

  # Routes used by census
  post '/dashboardapi/v1/census/:form_version', to: 'api/v1/census/census#create', defaults: {format: 'json'}

  # Routes used by donor teacher banner
  post '/dashboardapi/v1/users/:user_id/dismiss_donor_teacher_banner', to: 'api/v1/users#dismiss_donor_teacher_banner'

  # Routes used by standards info dialog
  post '/dashboardapi/v1/users/:user_id/set_standards_report_info_to_seen', to: 'api/v1/users#set_standards_report_info_to_seen'

  # Routes used by teacher scores
  post '/dashboardapi/v1/teacher_scores', to: 'api/v1/teacher_scores#score_lessons_for_section'
  get '/dashboardapi/v1/teacher_scores/:section_id/:script_id', to: 'api/v1/teacher_scores#get_teacher_scores_for_script', defaults: {format: 'json'}

  # We want to allow searchs with dots, for instance "St. Paul", so we specify
  # the constraint on :q to match anything but a slash.
  # @see http://guides.rubyonrails.org/routing.html#specifying-constraints
  get '/dashboardapi/v1/districtsearch/:q/:limit', to: 'api/v1/school_districts#search', defaults: {format: 'json'}, constraints: {q: /[^\/]+/}
  get '/dashboardapi/v1/schoolsearch/:q/:limit(/:use_new_search)', to: 'api/v1/schools#search', defaults: {format: 'json'}, constraints: {q: /[^\/]+/}

  get '/dashboardapi/v1/regional-partners/:school_district_id', to: 'api/v1/regional_partners#index', defaults: {format: 'json'}
  get '/dashboardapi/v1/projects/section/:section_id', to: 'api/v1/projects/section_projects#index', defaults: {format: 'json'}
  get '/dashboardapi/courses', to: 'courses#index', defaults: {format: 'json'}

  post '/dashboardapi/v1/text_to_speech/azure', to: 'api/v1/text_to_speech#azure', defaults: {format: 'json'}

  get 'foorm/preview/:name', to: 'foorm_preview#name', constraints: {name: /.*/}
  get 'foorm/preview', to: 'foorm_preview#index'

  post '/safe_browsing', to: 'safe_browsing#safe_to_open', defaults: {format: 'json'}

  get '/curriculum_tracking_pixel', to: 'curriculum_tracking_pixel#index'

  post '/profanity/find', to: 'profanity#find'

  get '/help', to: redirect("https://support.code.org")

  post '/i18n/track_string_usage', action: :track_string_usage, controller: :i18n

  get '/javabuilder/access_token', to: 'javabuilder_sessions#get_access_token'

  get '/sprites/sprite_upload', to: 'sprite_management#sprite_upload'

  # These really belong in the foorm namespace,
  # but we leave them outside so that we can easily use the simple "/form" paths.
  get '/form/:path/configuration', to: 'foorm/simple_survey_forms#configuration'
  get '/form/:path', to: 'foorm/simple_survey_forms#show'

  namespace :foorm do
    resources :simple_survey_forms, only: [:index, :new, :create]

    resources :forms, only: [:create] do
      member do
        put :update_questions
        put :publish
      end
      get :editor, on: :collection
    end

    resources :libraries, only: [] do
      member do
        get :question_names
      end
      get :editor, on: :collection
    end

    resources :library_questions, only: [:create, :show, :update] do
      member do
        get :published_forms_appeared_in
      end
    end
  end
end
