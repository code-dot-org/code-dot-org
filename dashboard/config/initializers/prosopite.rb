if Rails.env.development?
  begin
    require 'prosopite/middleware/rack'
    Rails.configuration.middleware.use(Prosopite::Middleware::Rack)
  rescue LoadError
    # Production-gem images (docker/migrate) boot development without the
    # development gem group; N+1 detection just goes missing there.
  end
end
