if Rails.env.development? && Gem.loaded_specs.key?('prosopite')
  require 'prosopite/middleware/rack'
  Rails.configuration.middleware.use(Prosopite::Middleware::Rack)
end
