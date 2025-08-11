# frozen_string_literal: true

HocLegacy::Engine.routes.draw do
  resources :tutorials, path: :hour, param: :short_code, only: %i[show]

  scope '/api/hour', controller: :tutorials do
    get '/begin/:code', action: :begin
    get '/begin_:code.png', action: :begin_pixel

    get :finish, action: :finish_current
    get '/finish/:code', action: :finish
    get '/finish_:code.png', action: :finish_pixel

    post :certificate
  end

  post '/v2/certificate', controller: :tutorials, action: :certificate
end
