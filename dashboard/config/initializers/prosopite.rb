if Rails.env.development?
  require 'prosopite/middleware/rack'
  Rails.configuration.middleware.use(Prosopite::Middleware::Rack)
end
