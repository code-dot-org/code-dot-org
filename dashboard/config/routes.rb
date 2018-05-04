# For documentation see, e.g., http://guides.rubyonrails.org/routing.html.

module OPS
  API = 'api'.freeze unless defined? API
  DASHBOARDAPI = 'dashboardapi'.freeze unless defined? DASHBOARDAPI
end

Dashboard::Application.routes.draw do
  resources :survey_results, only: [:create], defaults: {format: 'json'}

  resource :pairing, only: [:show, :update]

  resources :user_levels, only: [:update, :destroy]

  get '/download/:product', to: 'hoc_download#index'

  get '/terms-and-privacy', to: 'home#terms_and_privacy'
  get '/dashboardapi/terms-and-privacy', to: "home#terms_and_privacy"
  get '/dashboardapi/teacher-announcements', to: "home#teacher_announcements"
  get '/dashboardapi/hoc-courses-narrow', to: "home#hoc_courses_narrow"
  get '/dashboardapi/hoc-courses-challenge', to: "home#hoc_courses_challenge"

  get "/home", to: "home#home"

  get "/congrats", to: "congrats#index"

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

  get 'maker/home', to: 'maker#home'
  get 'maker/setup', to: 'maker#setup'
  get 'maker/discountcode', to: 'maker#discountcode'
  post 'maker/apply', to: 'maker#apply'
  post 'maker/schoolchoice', to: 'maker#schoolchoice'
  post 'maker/complete', to: 'maker#complete'
  get 'maker/application_status', to: 'maker#application_status'
  post 'maker/override', to: 'maker#override'

  # Media proxying
  get 'media', to: 'media_proxy#get', format: false

  # XHR proxying
  get 'xhr', to: 'xhr_proxy#get', format: false

  get 'redirected_url', to: 'redirect_proxy#get', format: false

  get 'docs/*path', to: 'curriculum_proxy#get_doc'
  get 'curriculum/*path', to: 'curriculum_proxy#get_curriculum'

  # User-facing section routes
  resources :sections, only: [:show, :update] do
    member do
      post 'log_in'
    end
  end
  # Section API routes (JSON only)
  concern :section_api_routes do
    resources :sections, only: [:index, :show, :create, :destroy] do
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
    patch '/dashboardapi/users', to: 'registrations#update'
    patch '/users/upgrade', to: 'registrations#upgrade'
    patch '/users/set_age', to: 'registrations#set_age'
    get '/users/clever_takeover', to: 'sessions#clever_takeover'
    get '/users/clever_modal_dismissed', to: 'sessions#clever_modal_dismissed'
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

  get 'projects/featured', to: 'projects#featured'
  put '/featured_projects/:project_id/unfeature', to: 'featured_projects#unfeature'
  put '/featured_projects/:project_id/feature', to: 'featured_projects#feature'

  get '/projects/public', to: 'projects#public'
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
  get '/flappy/lang/ar', to: 'home#set_locale', as: 'flappy/lang/ar', locale: 'ar-SA', user_return_to: '/flappy/1'
  get '/playlab/lang/ar', to: 'home#set_locale', as: 'playlab/lang/ar', locale: 'ar-SA', user_return_to: '/s/playlab/stage/1/puzzle/1'
  get '/artist/lang/ar', to: 'home#set_locale', as: 'artist/lang/ar', locale: 'ar-SA', user_return_to: '/s/artist/stage/1/puzzle/1'

  # /lang/xx shortcut for all routes
  get '/lang/:locale', to: 'home#set_locale', user_return_to: '/'
  get '*i18npath/lang/:locale', to: 'home#set_locale'

  resources :levels do
    get 'edit_blocks/:type', to: 'levels#edit_blocks', as: 'edit_blocks'
    get 'embed_level', to: 'levels#embed_level', as: 'embed_level'
    post 'update_blocks/:type', to: 'levels#update_blocks', as: 'update_blocks'
    post 'clone', to: 'levels#clone'
  end

  post 'level_assets/upload', to: 'level_assets#upload'

  resources :scripts, path: '/s/' do
    # /s/xxx/reset
    get 'reset', to: 'script_levels#reset'
    get 'next', to: 'script_levels#next'
    get 'hidden_stages', to: 'script_levels#hidden_stage_ids'
    post 'toggle_hidden', to: 'script_levels#toggle_hidden'

    get 'instructions', to: 'scripts#instructions'

    # /s/xxx/stage/yyy/puzzle/zzz
    resources :stages, only: [], path: "/stage", param: 'position', format: false do
      get 'extras', to: 'script_levels#stage_extras', format: false
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

  resources :courses, param: 'course_name'
  get '/course/:course_name', to: redirect('/courses/%{course_name}')

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

  post '/milestone/:user_id/level/:level_id', to: 'activities#milestone', as: 'milestone_level'
  post '/milestone/:user_id/:script_level_id', to: 'activities#milestone', as: 'milestone'
  post '/milestone/:user_id/:script_level_id/:level_id', to: 'activities#milestone', as: 'milestone_script_level'

  get '/admin', to: 'admin_reports#directory', as: 'admin_directory'
  resources :regional_partners
  post 'regional_partners/:id/assign_program_manager', controller: 'regional_partners', action: 'assign_program_manager'
  get 'regional_partners/:id/remove_program_manager/:program_manager_id', controller: 'regional_partners', action: 'remove_program_manager'
  post 'regional_partners/:id/add_mapping', controller: 'regional_partners', action: 'add_mapping'
  get 'regional_partners/:id/remove_mapping/:id', controller: 'regional_partners', action: 'remove_mapping'

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

  get '/notes/:key', to: 'notes#index'

  resources :zendesk_session, only: [:index]

  post '/report_abuse', to: 'report_abuse#report_abuse'
  get '/report_abuse', to: 'report_abuse#report_abuse_form'

  get '/too_young', to: 'too_young#index'

  post '/sms/send', to: 'sms#send_to_phone', as: 'send_to_phone'

  # Experiments are get requests so that a user can click on a link to join or leave an experiment
  get '/experiments/set_course_experiment/:experiment_name', to: 'experiments#set_course_experiment'
  get '/experiments/set_single_user_experiment/:experiment_name', to: 'experiments#set_single_user_experiment'
  get '/experiments/disable_single_user_experiment/:experiment_name', to: 'experiments#disable_single_user_experiment'

  get '/peer_reviews/dashboard', to: 'peer_reviews#dashboard'
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
        collection do
          get :filter
          get :upcoming_teachercons
        end
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
        get :local_workshop_survey_report, action: :local_workshop_survey_report, controller: 'workshop_survey_report'
        get :teachercon_survey_report, action: :teachercon_survey_report, controller: 'workshop_survey_report'
        get :workshop_organizer_survey_report, action: :workshop_organizer_survey_report, controller: 'workshop_organizer_survey_report'
      end
      resources :workshop_summary_report, only: :index
      resources :teacher_attendance_report, only: :index
      resources :course_facilitators, only: :index
      resources :workshop_organizers, only: :index
      get 'workshop_organizer_survey_report_for_course/:course', action: :index, controller: 'workshop_organizer_survey_report'

      get :teacher_applications, to: 'teacher_applications#index'
      post :teacher_applications, to: 'teacher_applications#create'

      # persistent namespace for Teachercon and FiT Weekend registrations, can be updated/replaced each year
      post 'teachercon_registrations', to: 'teachercon1819_registrations#create'
      post 'teachercon_partner_registrations', to: 'teachercon1819_registrations#create_partner_or_lead_facilitator'
      post 'teachercon_lead_facilitator_registrations', to: 'teachercon1819_registrations#create_partner_or_lead_facilitator'
      post 'fit_weekend_registrations', to: 'fit_weekend1819_registrations#create'

      post :facilitator_program_registrations, to: 'facilitator_program_registrations#create'
      post :regional_partner_program_registrations, to: 'regional_partner_program_registrations#create'

      post :pre_workshop_surveys, to: 'pre_workshop_surveys#create'
      post :workshop_surveys, to: 'workshop_surveys#create'
      post :teachercon_surveys, to: 'teachercon_surveys#create'
      post :regional_partner_contacts, to: 'regional_partner_contacts#create'
      get :regional_partner_workshops, to: 'regional_partner_workshops#index'
      get 'regional_partner_workshops/find', to: 'regional_partner_workshops#find'

      namespace :application do
        post :facilitator, to: 'facilitator_applications#create'
        post :teacher, to: 'teacher_applications#create'
        post :principal_approval, to: 'principal_approval_applications#create'
      end

      resources :applications, controller: 'applications', only: [:index, :show, :update, :destroy] do
        collection do
          get :quick_view
          get :cohort_view
          get :search
          get :teachercon_cohort
          get :fit_cohort
        end
      end
    end
  end

  get 'my-professional-learning', to: 'pd/professional_learning_landing#index', as: 'professional_learning_landing'

  namespace :pd do
    # React-router will handle sub-routes on the client.
    get 'workshop_dashboard/*path', to: 'workshop_dashboard#index'
    get 'workshop_dashboard', to: 'workshop_dashboard#index'

    get 'teacher_application', to: 'teacher_application#new'
    get 'teacher_application/international_teachers', to: 'teacher_application#international_teachers'
    get 'teacher_application/thanks', to: 'teacher_application#thanks'
    get 'teacher_application/manage', to: 'teacher_application#manage'
    get 'teacher_application/manage/:teacher_application_id', to: 'teacher_application#edit'
    patch 'teacher_application/manage/:teacher_application_id', to: 'teacher_application#update'
    post 'teacher_application/manage/:teacher_application_id/upgrade_to_teacher', to: 'teacher_application#upgrade_to_teacher'
    get 'teacher_application/manage/:teacher_application_id/email', to: 'teacher_application#construct_email'
    post 'teacher_application/manage/:teacher_application_id/email', to: 'teacher_application#send_email'

    namespace :application do
      get 'facilitator', to: 'facilitator_application#new'
      get 'teacher', to: 'teacher_application#new'
      get 'principal_approval/:application_guid', to: 'principal_approval_application#new', as: 'principal_approval'
    end

    # persistent namespace for Teachercon and FiT Weekend registrations, can be updated/replaced each year
    get 'teachercon_registration/partner(/:city)', to: 'teachercon1819_registration#partner'
    get 'teachercon_registration/lead_facilitator(/:city)', to: 'teachercon1819_registration#lead_facilitator'
    get 'teachercon_registration/:application_guid', to: 'teachercon1819_registration#new'
    get 'fit_weekend_registration/:application_guid', to: 'fit_weekend1819_registration#new'

    delete 'teachercon_registration/:application_guid', to: 'teachercon1819_registration#destroy'
    delete 'fit_weekend_registration/:application_guid', to: 'fit_weekend1819_registration#destroy'

    get 'facilitator_program_registration', to: 'facilitator_program_registration#new'
    get 'regional_partner_program_registration', to: 'regional_partner_program_registration#new'

    get 'workshops/:workshop_id/enroll', action: 'new', controller: 'workshop_enrollment'
    post 'workshops/:workshop_id/enroll', action: 'create', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code', action: 'show', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code/thanks', action: 'thanks', controller: 'workshop_enrollment'
    get 'workshop_enrollment/:code/cancel', action: 'cancel', controller: 'workshop_enrollment'

    get 'workshop_materials/:enrollment_code', action: 'new', controller: 'workshop_material_orders'
    post 'workshop_materials/:enrollment_code', action: 'create', controller: 'workshop_material_orders'
    get 'workshop_materials', action: 'admin_index', controller: 'workshop_material_orders'

    get 'pre_workshop_survey/:enrollment_code', action: 'new', controller: 'pre_workshop_survey', as: 'new_pre_workshop_survey'
    get 'workshop_survey/:enrollment_code', action: 'new', controller: 'workshop_survey', as: 'new_workshop_survey'
    get 'teachercon_survey/:enrollment_code', action: 'new', controller: 'teachercon_survey', as: 'new_teachercon_survey'

    get 'generate_csf_certificate/:enrollment_code', controller: 'csf_certificate', action: 'generate_certificate'
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
    get 'regional_partner_contact/:contact_id/thanks', to: 'regional_partner_contact#thanks'

    # React-router will handle sub-routes on the client.
    get 'application_dashboard/*path', to: 'application_dashboard#index'
    get 'application_dashboard', to: 'application_dashboard#index'
  end

  get '/dashboardapi/section_progress/:section_id', to: 'api#section_progress'
  get '/dashboardapi/section_text_responses/:section_id', to: 'api#section_text_responses'
  get '/dashboardapi/section_assessments/:section_id', to: 'api#section_assessments'
  get '/dashboardapi/section_surveys/:section_id', to: 'api#section_surveys'
  get '/dashboardapi/student_progress/:section_id/:student_id', to: 'api#student_progress'
  scope 'dashboardapi', module: 'api/v1' do
    concerns :section_api_routes
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
  get '/api/section_progress/:section_id', to: 'api#section_progress', as: 'section_progress'
  get '/dashboardapi/section_level_progress/:section_id', to: 'api#section_level_progress', as: 'section_level_progress'
  get '/api/student_progress/:section_id/:student_id', to: 'api#student_progress', as: 'student_progress'
  get '/api/user_progress/:script', to: 'api#user_progress', as: 'user_progress'
  get '/api/user_progress/:script/:stage_position/:level_position', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage'
  get '/api/user_progress/:script/:stage_position/:level_position/:level', to: 'api#user_progress_for_stage', as: 'user_progress_for_stage_and_level'
  namespace :api do
    api_methods.each do |action|
      get action, action: action
    end
  end

  namespace :api do
    namespace :v1 do
      concerns :api_v1_pd_routes
      concerns :section_api_routes
      post 'users/:user_id/using_text_mode', to: 'users#post_using_text_mode'
      get 'users/:user_id/using_text_mode', to: 'users#get_using_text_mode'

      post 'users/:user_id/post_ui_tip_dismissed', to: 'users#post_ui_tip_dismissed'

      post 'users/:user_id/postpone_census_banner', to: 'users#postpone_census_banner'
      post 'users/:user_id/dismiss_census_banner', to: 'users#dismiss_census_banner'

      get 'school-districts/:state', to: 'school_districts#index', defaults: {format: 'json'}
      get 'schools/:school_district_id/:school_type', to: 'schools#index', defaults: {format: 'json'}
      get 'schools/:id', to: 'schools#show', defaults: {format: 'json'}
      get 'regional_partners/:school_district_id/:course', to: 'regional_partners#for_school_district_and_course', defaults: {format: 'json'}
      get 'regional_partners', to: 'regional_partners#index', defaults: {format: 'json'}
      get 'regional_partners/capacity', to: 'regional_partners#capacity'

      get 'projects/gallery/public/:project_type/:limit(/:published_before)', to: 'projects/public_gallery#index', defaults: {format: 'json'}

      # Routes used by UI test status pages
      get 'test_logs/*prefix/since/:time', to: 'test_logs#get_logs_since', defaults: {format: 'json'}
      get 'test_logs/*prefix/:name', to: 'test_logs#get_log_details', defaults: {format: 'json'}

      # Routes used by the peer reviews admin pages
      get 'peer_review_submissions/index', to: 'peer_review_submissions#index'
      get 'peer_review_submissions/report_csv', to: 'peer_review_submissions#report_csv'
    end
  end

  get '/dashboardapi/v1/school-districts/:state', to: 'api/v1/school_districts#index', defaults: {format: 'json'}
  get '/dashboardapi/v1/schools/:school_district_id/:school_type', to: 'api/v1/schools#index', defaults: {format: 'json'}
  get '/dashboardapi/v1/schools/:id', to: 'api/v1/schools#show', defaults: {format: 'json'}

  # Routes used by census
  post '/dashboardapi/v1/census/:form_version', to: 'api/v1/census/census#create', defaults: {format: 'json'}

  # We want to allow searchs with dots, for instance "St. Paul", so we specify
  # the constraint on :q to match anything but a slash.
  # @see http://guides.rubyonrails.org/routing.html#specifying-constraints
  get '/dashboardapi/v1/districtsearch/:q/:limit', to: 'api/v1/school_districts#search', defaults: {format: 'json'}, constraints: {q: /[^\/]+/}
  get '/dashboardapi/v1/schoolsearch/:q/:limit(/:use_new_search)', to: 'api/v1/schools#search', defaults: {format: 'json'}, constraints: {q: /[^\/]+/}

  get '/dashboardapi/v1/regional-partners/:school_district_id', to: 'api/v1/regional_partners#index', defaults: {format: 'json'}
  get '/dashboardapi/v1/projects/section/:section_id', to: 'api/v1/projects/section_projects#index', defaults: {format: 'json'}
  get '/dashboardapi/courses', to: 'courses#index', defaults: {format: 'json'}
end
