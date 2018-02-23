# Load a minimal dummy Rails app for env defaults if one isn't already loaded.
# This provides
unless defined?(Rails) && Rails.application
  # Skip Sass-plugin railtie because it depends on ActionController.
  Sass::RAILS_LOADED = true
  require 'rails'
  class DummyApp < Rails::Application; end
  DummyApp.config.secret_key_base = CDO.dashboard_secret_key_base
end

# Rack middleware to inject Rails env_config into the Rack environment.
class RailsEnvConfig
  def initialize(app)
    @app = app
  end

  def call(env)
    env.merge!(Rails.application.env_config)
    @app.call(env)
  end
end
