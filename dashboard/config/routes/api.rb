Dashboard::Application.routes.draw do
  namespace :api do
    draw 'api/v1'

    scope :statsig, as: :statsig, controller: :statsig, defaults: {format: :json} do
      get :stable_id
    end
  end
end
