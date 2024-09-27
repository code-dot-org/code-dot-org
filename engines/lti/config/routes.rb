Lti::Engine.routes.draw do
  match '/login(/:platform_id)', to: 'lti_v1#login', via: [:get, :post]
  match '/authenticate', to: 'lti_v1#authenticate', via: [:get, :post]
  match '/sync_course', to: 'lti_v1#sync_course', via: [:get, :post]
  post '/integrations', to: 'lti_v1#create_integration'
  get '/integrations', to: 'lti_v1#new_integration'
  post '/upgrade_account', to: 'lti_v1#confirm_upgrade_account'

  resource :feedback, controller: :feedback, only: %i[create show]
  controller :dynamic_registration do
    get 'dynamic_registration', action: :new_registration
    post 'dynamic_registration', action: :create_registration
  end
  resources :sections, only: [] do
    collection do
      patch :bulk_update_owners
    end
  end
  namespace :account_linking do
    get :landing
    get :existing_account
    get :finish_link
    post :link_email
    post :new_account
    post :unlink
  end
end
