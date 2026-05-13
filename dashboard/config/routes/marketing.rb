Dashboard::Application.routes.draw do
  namespace :marketing do
    namespace :teacher do
      resources :promotions, only: [:show]
    end
  end
end
