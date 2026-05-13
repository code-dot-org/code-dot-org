# frozen_string_literal: true

Dashboard::Application.routes.draw do
  scope module: :hoc_legacy, path: HocLegacy::API_ROOT_PATH do
    resources :certificates, only: %i[show update], param: :session_id

    controller :tutorials do
      get '/begin/:code', action: :begin
      get '/begin_:code.png', action: :begin_pixel

      get :finish, action: :finish_current
      get '/finish/:code', action: :finish
      get '/finish_:code.png', action: :finish_pixel
    end
  end
end
