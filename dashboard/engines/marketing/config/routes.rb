Marketing::Engine.routes.draw do
  scope ':locale' do
    resources :campaign, only: [:show]
  end
end
