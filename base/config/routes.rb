Rails.application.routes.draw do
  mount Lti::Engine, at: "/lti/v1"
end
