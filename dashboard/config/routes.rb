module OPS
  API = 'api' unless defined? API
  DASHBOARDAPI = 'dashboardapi' unless defined? DASHBOARDAPI
end

Dashboard::Application.routes.draw do
  def redirect_to_teacher_dashboard
    redirect CDO.code_org_url('/teacher-dashboard')
  end

  resources :gallery_activities, path: '/gallery' do
    collection do
      get 'art', to: 'gallery_activities#index', app: Game::ARTIST
      get 'apps', to: 'gallery_activities#index', app: Game::PLAYLAB
    end
  end
  resources :activity_hints, only: [:update]
  resources :callouts
  resources :videos do
    collection do
      get 'test'
      get 'embed/:key', to: 'videos#embed', as: 'embed'
    end
  end

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
  get '/admin/debug', to: 'home#debug'
  get '/home/:action', controller: 'home'

  resources :projects, path: '/p/', only: [:index] do
    collection do
      get '/artist', to: 'levels#show', key: 'New Artist Project', as: 'artist'
      get '/playlab', to: 'levels#show', key: 'New Play Lab Project', as: 'playlab'
      get '/applab', to: 'levels#show', key: 'New App Lab Project', as: 'applab'
      get '/:template', to: 'projects#template'
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

  resources :scripts, path: '/s/' do
    # /s/xxx/level/yyy
    resources :script_levels, as: :levels, only: [:show], path: "/level", format: false do
      get 'solution', to: 'script_levels#solution'
    end

    # /s/xxx/reset
    get 'reset', to: 'script_levels#show', reset: true

    # /s/xxx/puzzle/yyy
    get 'puzzle/:chapter', to: 'script_levels#show', as: 'puzzle', format: false

    # /s/xxx/stage/yyy/puzzle/zzz
    resources :stages, only: [:show], path: "/stage", format: false do
      resources :script_levels, only: [:show], path: "/puzzle", format: false do
      end
    end
  end

  get '/beta', to: redirect('/')

  get 'reset_session', to: 'application#reset_session_endpoint'

  get '/hoc/reset', to: 'script_levels#show', script_id: Script::HOC_NAME, reset:true, as: 'hoc_reset'
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
  post '/join/:section_code', to: 'followers#student_register', as: 'student_register'

  post '/milestone/:user_id/level/:level_id', :to => 'activities#milestone', :as => 'milestone_level'
  post '/milestone/:user_id/:script_level_id', :to => 'activities#milestone', :as => 'milestone'

  get '/admin/levels(/:start_date)(/:end_date)(/filter/:filter)', to: 'reports#level_completions', as: 'level_completions'
  get '/admin/usage', to: 'reports#all_usage', as: 'all_usage'
  get '/admin/stats', to: 'reports#admin_stats', as: 'admin_stats'
  get '/admin/progress', to: 'reports#admin_progress', as: 'admin_progress'
  get '/admin/concepts', to: 'reports#admin_concepts', as: 'admin_concepts'
  get '/admin/gallery', to: 'reports#admin_gallery', as: 'admin_gallery'
  get '/admin/assume_identity', to: 'reports#assume_identity_form', as: 'assume_identity_form'
  post '/admin/assume_identity', to: 'reports#assume_identity', as: 'assume_identity'
  get '/admin/lookup_section', to: 'reports#lookup_section', as: 'lookup_section'
  post '/admin/lookup_section', to: 'reports#lookup_section'
  get '/stats/usage/:user_id', to: 'reports#usage', as: 'usage'
  get '/stats/students', to: redirect_to_teacher_dashboard
  get '/stats/:user_id', to: 'reports#user_stats', as: 'user_stats'
  get '/stats/level/:level_id', to: 'reports#level_stats', as: 'level_stats'
  get '/popup/stats', to: 'reports#header_stats', as: 'header_stats'
  get '/redeemprizes', to: 'reports#prizes', as: 'my_prizes'

  get '/notes/:key', to: 'notes#index'

  resources :zendesk_session, only: [:index]

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

  get '/dashboardapi/section_progress/:id', to: 'api#section_progress'
  get '/dashboardapi/student_progress/:section_id/:id', to: 'api#student_progress'
  get '/dashboardapi/:action', controller: 'api'

  get '/api/section_progress/:id', to: 'api#section_progress', as: 'section_progress'
  get '/api/student_progress/:section_id/:id', to: 'api#student_progress', as: 'student_progress'
  get '/api/:action', controller: 'api'

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
