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

  # /api/v1/projects/:type
  resources :projects, only: [], param: :type do
    member do
      # /api/v1/projects/:type/level_properties
      get :level_properties
    end
  end
end
