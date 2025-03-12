Marketing::Engine.routes.draw do
  namespace :teacher do
    resources :promotions, only: [:show], to: 'promotions#show'
  end
end
