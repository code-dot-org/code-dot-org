Rails.application.routes.draw do
  root "home#index"
  get "/health_check", to: "home#health_check"
end
