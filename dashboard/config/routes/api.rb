# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    draw 'api/v1'
  end
end
