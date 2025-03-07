Marketing::Engine.routes.draw do
  scope ':locale' do
    resources :promotions, only: [:show]
  end
end
