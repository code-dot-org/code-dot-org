# For documentation see, e.g., http://guides.rubyonrails.org/routing.html.

module OPS
  API = 'api' unless defined? API
  DASHBOARDAPI = 'dashboardapi' unless defined? DASHBOARDAPI
end

Dashboard::Application.routes.draw do
  resources :survey_results, only: [:create], defaults: { format: 'json' }

  resource :pairing, only: [:show, :update]

  resources :user_levels, only: [:update, :destroy]

  get '/download/:product', to: 'hoc_download#index'

  get '/terms-and-privacy', to: 'home#terms_and_privacy'

  resources :gallery_activities, path: '/gallery' do
    collection do
      get 'art', to: 'gallery_activities#index', app: Game::ARTIST
      get 'apps', to: 'gallery_activities#index', app: Game::PLAYLAB
    end
  end
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

  get 'maker/setup', to: 'maker#setup'

  # Media proxying
  get 'media', to: 'media_proxy#get', format: false

  # XHR proxying
  get 'xhr', to: 'xhr_proxy#get', format: false

  get 'redirected_url', to: 'redirect_proxy#get', format: false

  resources :sections, only: [:show] do
    member do
      post 'log_in'
    end
  end

  post '/dashboardapi/sections/transfers', to: 'transfers#create'
  post '/api/sections/transfers', to: 'transfers#create'

  get '/sh/:id', to: redirect('/c/%{id}')
  get '/sh/:id/:action_id', to: redirect('/c/%{id}/%{action_id}')

  get '/u/:id', to: redirect('/c/%{id}')
  get '/u/:id/:action_id', to: redirect('/c/%{id}/%{action_id}')

  resources :level_sources, path: '/c/', only: [:show, :edit, :update] do
    member do
      get 'generate_image'
      get 'original_image'
    end
  end
  get '/share/:id', to: redirect('/c/%{id}')

  devise_scope :user do
    get '/oauth_sign_out/:provider', to: 'sessions#oauth_sign_out', as: :oauth_sign_out
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

  root :to => "home#index"
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

  resources :projects, path: '/projects/', only: [:index] do
    collection do
      ProjectsController::STANDALONE_PROJECTS.each do |key, _|
        get "/#{key}", to: 'projects#load', key: key.to_s, as: "#{key}_project"
        get "/#{key}/new", to: 'projects#create_new', key: key.to_s, as: "#{key}_project_create_new"
        get "/#{key}/:channel_id", to: 'projects#show', key: key.to_s, as: "#{key}_project_share", share: true
        get "/#{key}/:channel_id/edit", to: 'projects#edit', key: key.to_s, as: "#{key}_project_edit"
        get "/#{key}/:channel_id/view", to: 'projects#show', key: key.to_s, as: "#{key}_project_view", readonly: true
        get "/#{key}/:channel_id/embed", to: 'projects#show', key: key.to_s, as: "#{key}_project_iframe_embed", iframe_embed: true
        get "/#{key}/:channel_id/remix", to: 'projects#remix', key: key.to_s, as: "#{key}_project_remix"
      end
      get '/angular', to: 'projects#angular'
    end
  end

  resources :projects_lists, path: '/projects-lists/', only: [:index] do
    collection do
      get "/:section_id", to: 'projects_lists#index'
    end
  end

  post '/locale', to: 'home#set_locale', as: 'locale'

  # quick links for cartoon network arabic
  get '/flappy/lang/ar', to: 'home#set_locale', as: 'flappy/lang/ar', locale: 'ar-SA', return_to: '/flappy/1'
  get '/playlab/lang/ar', to: 'home#set_locale', as: 'playlab/lang/ar', locale: 'ar-SA', return_to: '/s/playlab/stage/1/puzzle/1'
  get '/artist/lang/ar', to: 'home#set_locale', as: 'artist/lang/ar', locale: 'ar-SA', return_to: '/s/artist/stage/1/puzzle/1'

  # /lang/xx shortcut for all routes
  get '/lang/:locale', to: 'home#set_locale', return_to: '/'
  get '*i18npath/lang/:locale', to: 'home#set_locale'

  resources :levels do
    get 'edit_blocks/:type', to: 'levels#edit_blocks', as: 'edit_blocks'
    get 'embed_level', to: 'levels#embed_level', as: 'embed_level'
    get 'embed_blocks/:block_type', to: 'levels#embed_blocks', as: 'embed_blocks'
    post 'update_blocks/:type', to: 'levels#update_blocks', as: 'update_blocks'
    post 'clone', to: 'levels#clone'
  end

  post 'level_assets/upload', to: 'level_assets#upload'

  resources :scripts, path: '/s/' do
    # /s/xxx/reset
    get 'reset', to: 'script_levels#reset'
    get 'next', to: 'script_levels#next'
    get 'hidden_stages', to: 'script_levels#hidden'
    post 'toggle_hidden', to: 'script_levels#toggle_hidden'

    get 'instructions', to: 'scripts#instructions'

    # /s/xxx/stage/yyy/puzzle/zzz
    resources :stages, only: [], path: "/stage", param: 'position', format: false do
      get 'summary_for_lesson_plans', to: 'script_levels#summary_for_lesson_plans', format: false
      resources :script_levels, only: [:show], path: "/puzzle", format: false do
        member do
          # /s/xxx/stage/yyy/puzzle/zzz/page/ppp
          get 'page/:puzzle_page', to: 'script_levels#show', as: 'puzzle_page', format: false
        end
      end
    end

    # /s/xxx/lockable/yyy/puzzle/zzz
    resources :lockable_stages, only: [], path: "/lockable", param: 'position', format: false do
      get 'summary_for_lesson_plans', to: 'script_levels#summary_for_lesson_plans', format: false
      resources :script_levels, only: [:show], path: "/puzzle", format: false do
        member do
          # /s/xxx/stage/yyy/puzzle/zzz/page/ppp
          get 'page/:puzzle_page', to: 'script_levels#show', as: 'puzzle_page', format: false
        end
      end
    end

    get 'preview-assignments', to: 'plc/enrollment_evaluations#preview_assignments', as: 'preview_assignments'
    post 'confirm_assignments', to: 'plc/enrollment_evaluations#confirm_assignments', as: 'confirm_assignments'

    get 'pull-review', to: 'peer_reviews#pull_review', as: 'pull_review'
  end

  get '/course/:course', to: 'plc/user_course_enrollments#index', as: 'course'

  get '/beta', to: redirect('/')

  get 'reset_session', to: 'application#reset_session_endpoint'

  get '/hoc/reset', to: 'script_levels#reset', script_id: Script::HOC_NAME, as: 'hoc_reset'
  get '/hoc/:chapter', to: 'script_levels#show', script_id: Script::HOC_NAME, as: 'hoc_chapter', format: false

  get '/flappy/:chapter', to: 'script_levels#show', script_id: Script::FLAPPY_NAME, as: 'flappy_chapter', format: false
  get '/jigsaw/:chapter', to: 'script_levels#show', script_id: Script::JIGSAW_NAME, as: 'jigsaw_chapter', format: false

  get '/weblab/host', to: 'weblab_host#index'

  resources :followers, only: [:create]
  post '/followers/remove', to: 'followers#remove', as: 'remove_follower'

  get '/join(/:section_code)', to: 'followers#student_user_new', as: 'student_user_new'
  post '/join(/:section_code)', to: 'followers#student_register', as: 'student_register'

  post '/milestone/:user_id/level/:level_id', :to => 'activities#milestone', :as => 'milestone_level'
  post '/milestone/:user_id/:script_level_id', :to => 'activities#milestone', :as => 'milestone'
  post '/milestone/:user_id/:script_level_id/:level_id', :to => 'activities#milestone', :as => 'milestone_script_level'

  get '/admin', to: 'admin_reports#directory', as: 'admin_directory'

  # one-off internal reports
  get '/admin/temp/diversity_survey', to: 'admin_reports#diversity_survey', as: 'diversity_survey'

  # HOC dashboards.
  get '/admin/hoc/students_served', to: 'admin_hoc#students_served', as: 'hoc_students_served'
  get '/admin/hoc/event_signups', to: 'admin_hoc#event_signups', as: 'hoc_event_signups'

  # internal report dashboards
  get '/admin/levels', to: 'admin_reports#level_completions', as: 'level_completions'
  get '/admin/level_answers(.:format)', to: 'admin_reports#level_answers', as: 'level_answers'
  get '/admin/pd_progress(/:script)', to: 'admin_reports#pd_progress', as: 'pd_progress'
  get '/admin/progress', to: 'admin_reports#admin_progress', as: 'admin_progress'
  get '/admin/stats', to: 'admin_reports#admin_stats', as: 'admin_stats'
  get '/admin/usage', to: 'admin_reports#all_usage', as: 'all_usage'
  get '/admin/debug', to: 'admin_reports#debug'

  # internal search tools
  get '/admin/find_students', to: 'admin_search#find_students', as: 'find_students'
  get '/admin/lookup_section', to: 'admin_search#lookup_section', as: 'lookup_section'
  post '/admin/lookup_section', to: 'admin_search#lookup_section'
  post '/admin/undelete_section', to: 'admin_search#undelete_section', as: 'undelete_section'

  # internal engineering dashboards
  get '/admin/dynamic_config', :to => 'dynamic_config#show', as: 'dynamic_config_state'
  get '/admin/feature_mode', :to => 'feature_mode#show', as: 'feature_mode'
  post '/admin/feature_mode', :to => 'feature_mode#update', as: 'feature_mode_update'

  get '/admin/account_repair', to: 'admin_users#account_repair_form', as: 'account_repair_form'
  post '/admin/account_repair', to: 'admin_users#account_repair', as: 'account_repair'
  get '/admin/assume_identity', to: 'admin_users#assume_identity_form', as: 'assume_identity_form'
  post '/admin/assume_identity', to: 'admin_users#assume_identity', as: 'assume_identity'
  get '/admin/confirm_email', to: 'admin_users#confirm_email_form', as: 'confirm_email_form'
  post '/admin/confirm_email', to: 'admin_users#confirm_email', as: 'confirm_email'
  post '/admin/undelete_user', to: 'admin_users#undelete_user', as: 'undelete_user'

  get '/admin/styleguide', :to => redirect('/styleguide/')

  get '/admin/gatekeeper', :to => 'dynamic_config#gatekeeper_show', as: 'gatekeeper_show'
  post '/admin/gatekeeper/delete', :to => 'dynamic_config#gatekeeper_delete', as: 'gatekeeper_delete'
  post '/admin/gatekeeper/set', :to => 'dynamic_config#gatekeeper_set', as: 'gatekeeper_set'

  get '/redeemprizes', to: 'reports#prizes', as: 'my_prizes'

  get '/notes/:key', to: 'notes#index'

  resources :zendesk_session, only: [:index]

  post '/report_abuse', :to => 'report_abuse#report_abuse'
  get '/report_abuse', :to => 'report_abuse#report_abuse_form'

  get '/too_young', :to => redirect { |_p, req| req.flash[:alert] = I18n.t("errors.messages.too_young"); '/' }

  post '/sms/send', to: 'sms#send_to_phone', as: 'send_to_phone'

  resources :peer_reviews

  concern :ops_routes do
    # /ops/district/:id
    resources :districts do
      member do
        get 'teachers'
      end
    end
    resources :cohorts do
      member do
        get 'teachers'
        delete 'teachers/:teacher_id', action: 'destroy_teacher'
      end
    end
    resources :workshops do
      resources :segments, shallow: true do # See http://guides.rubyonrails.org/routing.html#shallow-nesting
        resources :workshop_attendance, path: '/attendance', shallow: true do
        end
      end
      member do
        get 'teachers'
      end
    end

    get 'attendance/download/:workshop_id', action: 'attendance', controller: 'workshop_attendance'
    get 'attendance/teacher/:teacher_id', action: 'teacher', controller: 'workshop_attendance'
    get 'attendance/cohort/:cohort_id', action: 'cohort', controller: 'workshop_attendance'
    get 'attendance/workshop/:workshop_id', action: 'workshop', controller: 'workshop_attendance'
    post 'segments/:segment_id/attendance/batch', action: 'batch', controller: 'workshop_attendance'
  end

  namespace :ops, path: ::OPS::API, shallow_path: ::OPS::API do
    concerns :ops_routes
  end

  namespace :ops, path: ::OPS::DASHBOARDAPI, shallow_path: ::OPS::DASHBOARDAPI do
    concerns :ops_routes
  end

  get '/plc/user_course_enrollments/group_view', to: 'plc/user_course_enrollments#group_view'
  get '/plc/user_course_enrollments/manager_view/:id', to: 'plc/user_course_enrollments#manager_view', as: 'plc_user_course_enrollment_manager_view'

  namespace :plc do
    root to: 'plc#index'
    resources :user_course_enrollments
  end

  concern :api_v1_pd_routes do
    namespace :pd do
      resources :workshops do
        member do # See http://guides.rubyonrails.org/routing.html#adding-more-restful-actions
          post :start
          post :end
          get  :summary
        end
        resources :enrollments, controller: 'workshop_enrollments', only: [:index, :destroy]

        get :attendance, action: 'index', controller: 'workshop_attendance'
        get 'attendance/:session_id', action: 'show', controller: 'workshop_attendance'
        put 'attendance/:session_id/user/:user_id', action: 'create', controller: 'workshop_attendance'
        delete 'attendance/:session_id/user/:user_id', action: 'destroy', controller: 'workshop_attendance'
        put 'attendance/:session_id/enrollment/:enrollment_id', action: 'create_by_enrollment', controller: 'workshop_attendance'
        delete 'attendance/:session_id/enrollment/:enrollment_id', action: 'destroy_by_enrollment', controller: 'workshop_attendance'

        get :workshop_survey_report, action: :workshop_survey_report, controller: 'workshop_survey_report'
        get :workshop_organizer_survey_report, action: :workshop_organizer_survey_report, controller: 'workshop_organizer_survey_report'
      end
      resources :workshop_summary_report, only: :index
      resources :teacher_attendance_report, only: :index
      resources :course_facilitators, only: :index
      get 'workshop_organizer_survey_report_for_course/:course', action: :index, controller: 'workshop_organizer_survey_report'

      get :teacher_applications, to: 'teacher_applications#index'
      post :teacher_applications, to: 'teacher_applications#create'
    end
  end

  namespace :api do
    namespace :v1 do
      concerns :api_v1_pd_routes
    end
  end

  namespace :pd do
    # React-router will handle sub-routes on the client.
    get 'workshop_dashboard/*path', to: 'workshop_dashboard#index'
    get 'workshop_dashboard', to: 'workshop_dashboard#index'

    get 'teacher_application', to: 'teacher_application#new'
    get 'teacher_application/international_teachers', to: 'teacher_application#international_teachers'
    get 'teacher_application/thanks', to: 'teacher_application#thanks'

    get 'workshops/:workshop_id/enroll', action: 'new', controller: 'workshop_enrollment'
    post 'workshops/:workshop_id/enroll', action: 'create', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code', action: 'show', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code/cancel', action: 'cancel', controller: 'workshop_enrollment'
    get 'workshops/join/:section_code', action: 'join_section', controller: 'workshop_enrollment'
    post 'workshops/join/:section_code', action: 'confirm_join', controller: 'workshop_enrollment'
    patch 'workshops/join/:section_code', action: 'confirm_join', controller: 'workshop_enrollment'
  end

  get '/dashboardapi/section_progress/:section_id', to: 'api#section_progress'
  get '/dashboardapi/section_text_responses/:section_id', to: 'api#section_text_responses'
  get '/dashboardapi/section_assessments/:section_id', to: 'api#section_assessments'
  get '/dashboardapi/section_surveys/:section_id', to: 'api#section_surveys'
  get '/dashboardapi/student_progress/:section_id/:student_id', to: 'api#student_progress'

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

  post '/api/lock_status', to: 'api#update_lockable_state'
  get '/api/lock_status', to: 'api#lockable_state'
  get '/api/script_structure/:script_name', to: 'api#script_structure'
  get '/api/section_progress/:section_id', to: 'api#section_progress', as: 'section_progress'
  get '/api/student_progress/:section_id/:student_id', to: 'api#student_progress', as: 'student_progress'
  get '/api/user_progress/:script_name', to: 'api#user_progress', as: 'user_progress'
  get '/api/user_progress/:script_name/:stage_position/:level_position', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage'
  get '/api/user_progress/:script_name/:stage_position/:level_position/:level', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage_and_level'
  get '/api/user_progress', to: 'api#user_progress_for_all_scripts', as: 'user_progress_for_all_scripts'
  namespace :api do
    api_methods.each do |action|
      get action, action: action
    end
  end

  namespace :api do
    namespace :v1 do
      get 'school-districts/:state', to: 'school_districts#index', defaults: { format: 'json' }
      get 'schools/:school_district_id/:school_type', to: 'schools#index', defaults: { format: 'json' }
      get 'regional-partners/:school_district_id/:course', to: 'regional_partners#index', defaults: { format: 'json' }

      # Routes used by UI test status pages
      get 'test_logs/*prefix/since/:time', to: 'test_logs#get_logs_since', defaults: { format: 'json' }
      get 'test_logs/*prefix/:name', to: 'test_logs#get_log_details', defaults: { format: 'json' }
    end
  end

  get '/dashboardapi/v1/school-districts/:state', to: 'api/v1/school_districts#index', defaults: { format: 'json' }
  get '/dashboardapi/v1/schools/:school_district_id/:school_type', to: 'api/v1/schools#index', defaults: { format: 'json' }
  get '/dashboardapi/v1/regional-partners/:school_district_id', to: 'api/v1/regional_partners#index', defaults: { format: 'json' }
end
