require File.expand_path('../deployment', __FILE__)
require 'cdo/poste'
require 'rails/all'

require 'cdo/geocoder'
require 'cdo/properties'
require 'varnish_environment'
require 'files_api'
require 'channels_api'
require 'tables_api'
require 'shared_resources'
require 'net_sim_api'
require 'sound_library_api'
require 'animation_library_api'

require 'bootstrap-sass'
require 'cdo/hash'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Dashboard
  class Application < Rails::Application
    if Rails.env.development?
      require 'cdo/rack/whitelist'
      require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'
      config.middleware.insert_before ActionDispatch::Cookies, Rack::Whitelist::Downstream,
        HttpCache.config(rack_env)[:dashboard]

      require 'rack/cache'
      config.middleware.insert_before ActionDispatch::Cookies, Rack::Cache, ignore_headers: []

      config.middleware.insert_after Rack::Cache, Rack::Whitelist::Upstream,
        HttpCache.config(rack_env)[:dashboard]

      Rails.application.routes.default_url_options[:port] = CDO.dashboard_port

      # Autoload mailer previews in development mode so changes are picked up without restarting the server.
      # autoload_paths is frozen by time it gets to development.rb, so it must be done here.
      config.autoload_paths << Rails.root.join('test/mailers/previews')
    end

    if CDO.image_optim
      require 'cdo/rack/optimize'
      config.middleware.insert_before ActionDispatch::Static, ::Rack::Optimize
    end

    config.middleware.insert_after Rails::Rack::Logger, VarnishEnvironment
    config.middleware.insert_after VarnishEnvironment, FilesApi

    config.middleware.insert_after FilesApi, ChannelsApi
    config.middleware.insert_after ChannelsApi, TablesApi
    config.middleware.insert_after TablesApi, SharedResources
    config.middleware.insert_after SharedResources, NetSimApi
    config.middleware.insert_after NetSimApi, AnimationLibraryApi
    config.middleware.insert_after AnimationLibraryApi, SoundLibraryApi
    if CDO.dashboard_enable_pegasus && !ENV['SKIP_DASHBOARD_ENABLE_PEGASUS']
      require 'pegasus_sites'
      config.middleware.insert_after VarnishEnvironment, PegasusSites
    end

    require 'cdo/rack/upgrade_insecure_requests'
    config.middleware.use ::Rack::UpgradeInsecureRequests

    config.encoding = 'utf-8'

    Rails.application.routes.default_url_options[:host] = CDO.canonical_hostname('studio.code.org')

    config.generators do |g|
      g.template_engine :haml
    end
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # By default, config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    config.i18n.enforce_available_locales = false
    config.i18n.available_locales = ['en-US']
    config.i18n.fallbacks = {}
    config.i18n.default_locale = 'en-US'
    LOCALES = YAML.load_file("#{Rails.root}/config/locales.yml")
    LOCALES.each do |locale, data|
      next unless data.is_a? Hash
      data.symbolize_keys!
      unless data[:debug] && Rails.env.production?
        config.i18n.available_locales << locale
      end
      if data[:fallback]
        config.i18n.fallbacks[locale] = data[:fallback]
      end
    end

    config.pretty_sharedjs = CDO.pretty_js

    config.assets.gzip = false # cloudfront gzips everything for us on the fly.
    config.assets.paths << Rails.root.join('./public/blockly')
    config.assets.paths << Rails.root.join('../shared/css')
    config.assets.paths << Rails.root.join('../shared/js')

    config.assets.precompile += %w(
      js/*
      css/*.css
      assets/**/*
      angularProjects.js
      levels/*
      jquery.handsontable.full.css
      jquery.handsontable.full.js
      video-js/*.css
    )
    config.autoload_paths << Rails.root.join('lib')
    config.autoload_paths << Rails.root.join('app', 'models', 'experiments')
    config.autoload_paths << Rails.root.join('app', 'models', 'levels')
    config.autoload_paths << Rails.root.join('app', 'models', 'sections')

    # use https://(*-)studio.code.org urls in mails
    config.action_mailer.default_url_options = {host: CDO.canonical_hostname('studio.code.org'), protocol: 'https'}

    # Rails.cache is a fast memory store, cleared every time the application reloads.
    config.cache_store = :memory_store, {
      size: 256.megabytes # max size of entire store
    }

    # turn off ActionMailer logging to avoid logging email addresses
    ActionMailer::Base.logger = nil

    # Make sure dependency auto loading is enabled across all environments.
    # See http://edgeguides.rubyonrails.org/upgrading_ruby_on_rails.html#autoloading-is-disabled-after-booting-in-the-production-environment
    config.enable_dependency_loading = true

    if CDO.newrelic_logging
      require 'newrelic_rpm'
    end

    config.assets.image_optim = false unless CDO.image_optim

    config.experiment_cache_time_seconds = 60

    console do
      ARGV.push '-r', root.join('lib/console.rb')
    end
  end
end
