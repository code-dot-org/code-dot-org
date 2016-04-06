# For documentation see, e.g., http://guides.rubyonrails.org/routing.html.

module OPS
  API = 'api' unless defined? API
  DASHBOARDAPI = 'dashboardapi' unless defined? DASHBOARDAPI
end

Dashboard::Application.routes.draw do
  resources :survey_results, only: [:create], defaults: { format: 'json' }

  def redirect_to_teacher_dashboard
    redirect CDO.code_org_url('/teacher-dashboard')
  end

  resources :user_levels, only: [:update]

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

  get 'sections/new', to: redirect_to_teacher_dashboard
  get 'sections/:id/edit', to: redirect_to_teacher_dashboard

  resources :sections, only: [:show] do
    member do
      post 'log_in'
    end
  end

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

  get '/s/k-1(/*all)', to: redirect('/s/course1')
  get '/s/2-3(/*all)', to: redirect('/s/course2')
  get '/s/4-5(/*all)', to: redirect('/s/course3')

  resources :level_source_hints
  get '/add_hint/:level_source_id', :to => 'level_source_hints#add_hint', as: 'add_hint'
  get '/show_hints/:level_source_id', :to => 'level_source_hints#show_hints', as: 'show_hints'
  get '/add_pop_hint/:idx', :to => 'level_source_hints#add_pop_hint', as: 'add_pop_hint'
  get '/show_pop_hints/:idx(/:restriction)', :to => 'level_source_hints#show_pop_hints', as: 'show_pop_hints'
  get '/add_pop_hint_per_level/:level_id/:idx', :to => 'level_source_hints#add_pop_hint_per_level', as: 'add_pop_hint_per_level'
  get '/show_pop_hints_per_level/:level_id/:idx(/:restriction)', :to => 'level_source_hints#show_pop_hints_per_level', as: 'show_pop_hints_per_level'
  get '/add_hint_access', :to => 'level_source_hints#add_hint_access', as: 'add_hint_access'

  resources :frequent_unsuccessful_level_sources, only: [:index]

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
  end

  get '/beta', to: redirect('/')

  get 'reset_session', to: 'application#reset_session_endpoint'

  get '/hoc/reset', to: 'script_levels#reset', script_id: Script::HOC_NAME, as: 'hoc_reset'
  get '/hoc/:chapter', to: 'script_levels#show', script_id: Script::HOC_NAME, as: 'hoc_chapter', format: false

  get '/k8intro/:chapter', to: 'script_levels#show', script_id: Script::TWENTY_HOUR_NAME, as: 'k8intro_chapter', format: false
  get '/editcode/:chapter', to: 'script_levels#show', script_id: Script::EDIT_CODE_NAME, as: 'editcode_chapter', format: false
  get '/2014/:chapter', to: 'script_levels#show', script_id: Script::TWENTY_FOURTEEN_NAME, as: 'twenty_fourteen_chapter', format: false
  get '/flappy/:chapter', to: 'script_levels#show', script_id: Script::FLAPPY_NAME, as: 'flappy_chapter', format: false
  get '/jigsaw/:chapter', to: 'script_levels#show', script_id: Script::JIGSAW_NAME, as: 'jigsaw_chapter', format: false

  resources :followers, only: [:create]
  post '/followers/remove', to: 'followers#remove', as: 'remove_follower'

  # old teacher dashboard should redirect to new teacher dashboard
  get '/followers', to: redirect_to_teacher_dashboard
  get '/followers/:action', to: redirect_to_teacher_dashboard

  get '/join(/:section_code)', to: 'followers#student_user_new', as: 'student_user_new'
  post '/join(/:section_code)', to: 'followers#student_register', as: 'student_register'

  post '/milestone/:user_id/level/:level_id', :to => 'activities#milestone', :as => 'milestone_level'
  post '/milestone/:user_id/:script_level_id', :to => 'activities#milestone', :as => 'milestone'

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
  get 'admin/search_for_teachers', to: 'admin_search#search_for_teachers', as: 'search_for_teachers'
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

  get '/admin/gatekeeper', :to => 'dynamic_config#gatekeeper_show', as: 'gatekeeper_show'
  post '/admin/gatekeeper/delete', :to => 'dynamic_config#gatekeeper_delete', as: 'gatekeeper_delete'
  post '/admin/gatekeeper/set', :to => 'dynamic_config#gatekeeper_set', as: 'gatekeeper_set'
  get '/admin/:action', controller: 'reports', as: 'reports'

  get '/stats/usage/:user_id', to: redirect_to_teacher_dashboard
  get '/stats/students', to: redirect_to_teacher_dashboard
  get '/stats/:user_id', to: redirect_to_teacher_dashboard
  get '/popup/stats', to: 'reports#header_stats', as: 'header_stats'
  get '/redeemprizes', to: 'reports#prizes', as: 'my_prizes'

  get '/notes/:key', to: 'notes#index'

  resources :zendesk_session, only: [:index]

  post '/report_abuse', :to => 'report_abuse#report_abuse'
  get '/report_abuse', :to => 'report_abuse#report_abuse_form'

  get '/too_young', :to => redirect { |_p, req| req.flash[:alert] = I18n.t("errors.messages.too_young"); '/' }

  post '/sms/send', to: 'sms#send_to_phone', as: 'send_to_phone'

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

  get '/plc/content_creator/show_courses_and_modules', to: 'plc/content_creator#show_courses_and_modules'
  %w(courses learning_modules tasks course_units evaluation_questions).each do |object|
    get '/plc/' + object, to: redirect('plc/content_creator/show_courses_and_modules')
  end

  namespace :plc do
    resources :courses
    resources :learning_modules
    resources :tasks
    resources :user_course_enrollments
    resources :enrollment_task_assignments
    resources :course_units
    resources :enrollment_unit_assignments
    resources :evaluation_questions
  end

  get '/plc/enrollment_evaluations/:unit_assignment_id/perform_evaluation', to: 'plc/enrollment_evaluations#perform_evaluation', as: 'perform_evaluation'
  post '/plc/enrollment_evaluations/:unit_assignment_id/submit_evaluation', to: 'plc/enrollment_evaluations#submit_evaluation'

  get '/plc/learning_modules/:id/new_learning_resource_for_module', to: 'plc/learning_modules#new_learning_resource_for_module', as: 'new_learning_resource_for_module'

  post 'plc/course_units/:id/submit_new_questions_and_answers', to: 'plc/course_units#submit_new_questions_and_answers'

  get '/dashboardapi/section_progress/:section_id', to: 'api#section_progress'
  get '/dashboardapi/section_text_responses/:section_id', to: 'api#section_text_responses'
  get '/dashboardapi/section_assessments/:section_id', to: 'api#section_assessments'
  get '/dashboardapi/student_progress/:section_id/:student_id', to: 'api#student_progress'
  get '/dashboardapi/:action', controller: 'api'

  get '/api/section_progress/:section_id', to: 'api#section_progress', as: 'section_progress'
  get '/api/student_progress/:section_id/:student_id', to: 'api#student_progress', as: 'student_progress'
  get '/api/user_progress/:script_name', to: 'api#user_progress', as: 'user_progress'
  get '/api/user_progress/:script_name/:stage_position/:level_position', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage'
  get '/api/user_progress', to: 'api#user_progress_for_all_scripts', as: 'user_progress_for_all_scripts'
  get '/api/:action', controller: 'api'
end
