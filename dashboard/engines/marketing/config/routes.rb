Marketing::Engine.routes.draw do
  namespace :teacher do
    resources :promotions, only: [:show]
  end
end
