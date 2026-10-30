Dashboard::Application.routes.draw do
  namespace :api do
    draw 'api/v1'

    # Avoid "statsig" in the URL to reduce the risk of school content filtering.
    scope as: :statsig, controller: :statsig, defaults: {format: :json} do
      get :stable_id
    end
  end
end
