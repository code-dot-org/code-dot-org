# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      namespace :roster do
        namespace :clever do
          resources :sections, only: [] do
            collection do
              post :sync, action: :sync_all
            end
          end
        end
      end
    end
  end
end
