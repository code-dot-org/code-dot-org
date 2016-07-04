# For documentation see, e.g., http://guides.rubyonrails.org/routing.html.

module OPS
  API = 'api' unless defined? API
  DASHBOARDAPI = 'dashboardapi' unless defined? DASHBOARDAPI
end

Dashboard::Application.routes.draw do
  resources :survey_results, only: [:create], defaults: { format: 'json' }

  resources :user_levels, only: [:update]

  get '/download/:product', to: 'hoc_download#index'

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

  # Media proxying
  get 'media', to: 'media_proxy#get', format: false

  # XHR proxying
  get 'xhr', to: 'xhr_proxy#get', format: false

  resources :sections, only: [:show] do
    member do
      post 'log_in'
    end
  end

  post '/dashboardapi/sections/transfers', to: 'transfers#create'
  post '/api/sections/transfers', to: 'transfers#create'

  get '/sh/:id', to: redirect('/c/%{id}')
  get '/sh/:id/:action', to: redirect('/c/%{id}/%{action}')

  get '/u/:id', to: redirect('/c/%{id}')
  get '/u/:id/:action', to: redirect('/c/%{id}/%{action}')

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

  root :to => "home#index"
  get '/home_insert', to: 'home#home_insert'
  get '/health_check', to: 'home#health_check'
  get '/home/:action', controller: 'home'

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

    # /s/xxx/level/yyy
    resources :script_levels, as: :levels, only: [:show], path: "/level", format: false

    # /s/xxx/puzzle/yyy
    get 'puzzle/:chapter', to: 'script_levels#show', as: 'puzzle', format: false

    # /s/xxx/stage/yyy/puzzle/zzz
    resources :stages, only: [], path: "/stage", format: false do
      resources :script_levels, only: [:show], path: "/puzzle", format: false do
        member do
          # /s/xxx/stage/yyy/puzzle/zzz/page/ppp
          get 'page/:puzzle_page', to: 'script_levels#show', as: 'puzzle_page', format: false
        end
      end
    end

    get 'preview-assignments', to: 'plc/enrollment_evaluations#preview_assignments', as: 'preview_assignments'
    post 'confirm_assignments', to: 'plc/enrollment_evaluations#confirm_assignments', as: 'confirm_assignments'
  end

  get '/course/:course', to: 'plc/user_course_enrollments#index', as: 'course'

  get '/beta', to: redirect('/')

  get 'reset_session', to: 'application#reset_session_endpoint'

  get '/hoc/reset', to: 'script_levels#reset', script_id: Script::HOC_NAME, as: 'hoc_reset'
  get '/hoc/:chapter', to: 'script_levels#show', script_id: Script::HOC_NAME, as: 'hoc_chapter', format: false

  get '/flappy/:chapter', to: 'script_levels#show', script_id: Script::FLAPPY_NAME, as: 'flappy_chapter', format: false
  get '/jigsaw/:chapter', to: 'script_levels#show', script_id: Script::JIGSAW_NAME, as: 'jigsaw_chapter', format: false

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
  get '/admin/retention', to: 'admin_reports#retention', as: 'retention'
  get '/admin/retention/stages', to: 'admin_reports#retention_stages', as: 'retention_stages'
  get '/admin/stats', to: 'admin_reports#admin_stats', as: 'admin_stats'
  get '/admin/usage', to: 'admin_reports#all_usage', as: 'all_usage'
  get '/admin/debug', to: 'admin_reports#debug'

  # Fun-O-Meter dashboards.
  get '/admin/funometer', to: 'admin_funometer#funometer', as: 'funometer'
  get '/admin/funometer/script/:script_id', to: 'admin_funometer#funometer_by_script', as: 'funometer_by_script'
  get '/admin/funometer/stage/:stage_id', to: 'admin_funometer#funometer_by_stage', as: 'funometer_by_stage'
  get '/admin/funometer/script/:script_id/level/:level_id', to: 'admin_funometer#funometer_by_script_level', as: 'funometer_by_script_level'

  # internal search tools
  get '/admin/find_students', to: 'admin_search#find_students', as: 'find_students'
  get '/admin/search_for_teachers', to: 'admin_search#search_for_teachers', as: 'search_for_teachers'
  get '/admin/lookup_section', to: 'admin_search#lookup_section', as: 'lookup_section'
  post '/admin/lookup_section', to: 'admin_search#lookup_section'

  # internal engineering dashboards
  get '/admin/dynamic_config', :to => 'dynamic_config#show', as: 'dynamic_config_state'
  get '/admin/feature_mode', :to => 'feature_mode#show', as: 'feature_mode'
  post '/admin/feature_mode', :to => 'feature_mode#update', as: 'feature_mode_update'

  get '/admin/assume_identity', to: 'admin_users#assume_identity_form', as: 'assume_identity_form'
  post '/admin/assume_identity', to: 'admin_users#assume_identity', as: 'assume_identity'
  get '/admin/confirm_email', to: 'admin_users#confirm_email_form', as: 'confirm_email_form'
  post '/admin/confirm_email', to: 'admin_users#confirm_email', as: 'confirm_email'
  post '/admin/undelete_user', to: 'admin_users#undelete_user', as: 'undelete_user'

  get '/admin/styleguide', :to => redirect('/styleguide/')

  get '/admin/gatekeeper', :to => 'dynamic_config#gatekeeper_show', as: 'gatekeeper_show'
  post '/admin/gatekeeper/delete', :to => 'dynamic_config#gatekeeper_delete', as: 'gatekeeper_delete'
  post '/admin/gatekeeper/set', :to => 'dynamic_config#gatekeeper_set', as: 'gatekeeper_set'
  get '/admin/:action', controller: 'reports', as: 'reports'

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
        end
        get :enrollments, action: 'index', controller: 'workshop_enrollments'
        get :attendance, action: 'show', controller: 'workshop_attendance'
        patch :attendance, action: 'update', controller: 'workshop_attendance'
      end
      resources :district_report, only: :index
      resources :workshop_organizer_report, only: :index
      resources :teacher_progress_report, only: :index
      resources :course_facilitators, only: :index
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

    get 'workshops/:workshop_id/enroll', action: 'new', controller: 'workshop_enrollment'
    post 'workshops/:workshop_id/enroll', action: 'create', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code', action: 'show', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code/cancel', action: 'cancel', controller: 'workshop_enrollment'

    # This is a developer aid that allows previewing rendered mail views with fixed test data.
    # The route is restricted so it only exists in development mode.
    if Rails.env.development?
      mount Pd::MailPreviewController => 'mail_preview'
    end
  end

  get '/dashboardapi/section_progress/:section_id', to: 'api#section_progress'
  get '/dashboardapi/section_text_responses/:section_id', to: 'api#section_text_responses'
  get '/dashboardapi/section_assessments/:section_id', to: 'api#section_assessments'
  get '/dashboardapi/section_surveys/:section_id', to: 'api#section_surveys'
  get '/dashboardapi/student_progress/:section_id/:student_id', to: 'api#student_progress'
  get '/dashboardapi/:action', controller: 'api'
  get '/dashboardapi/v1/pd/k5workshops', to: 'api/v1/pd/workshops#k5_public_map_index'

  get '/api/script_structure/:script_name', to: 'api#script_structure'
  get '/api/section_progress/:section_id', to: 'api#section_progress', as: 'section_progress'
  get '/api/student_progress/:section_id/:student_id', to: 'api#student_progress', as: 'student_progress'
  get '/api/user_progress/:script_name', to: 'api#user_progress', as: 'user_progress'
  get '/api/user_progress/:script_name/:stage_position/:level_position', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage'
  get '/api/user_progress/:script_name/:stage_position/:level_position/:level', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage_and_level'
  get '/api/user_progress', to: 'api#user_progress_for_all_scripts', as: 'user_progress_for_all_scripts'
  get '/api/:action', controller: 'api'

  namespace :api do
    namespace :v1 do
      get 'school-districts/:state', to: 'school_districts#index', defaults: { format: 'json' }

      # Routes used by UI test status pages
      get 'test_logs/:branch/since/:time', to: 'test_logs#get_logs_since', defaults: { format: 'json' }
      get 'test_logs/:branch/:name', to: 'test_logs#get_log_details', defaults: { format: 'json' }
    end
  end

  get '/dashboardapi/v1/school-districts/:state', to: 'api/v1/school_districts#index', defaults: { format: 'json' }
end
