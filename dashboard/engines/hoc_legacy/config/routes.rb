# frozen_string_literal: true

Dashboard::Application.routes.draw do
  scope module: :hoc_legacy do
    scope HocLegacy::API_ROOT_PATH, controller: :tutorials do
      get '/begin/:code', action: :begin
      get '/begin_:code.png', action: :begin_pixel

      get :finish, action: :finish_current
      get '/finish/:code', action: :finish
      get '/finish_:code.png', action: :finish_pixel

      post :certificate
    end

    post '/v2/certificate', controller: :tutorials, action: :certificate
  end
end
