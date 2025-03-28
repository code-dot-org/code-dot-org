Marketing::Engine.routes.draw do
  namespace :teacher do
    resources :promotions, only: [:show] do
      collection do
        post 'hide/:promotion_id', action: :hide
      end
    end
  end
end
