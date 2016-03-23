require File.expand_path('../deployment', __FILE__)
require 'cdo/poste'
require 'rails/all'

require 'cdo/geocoder'
require 'cdo/properties'
require 'varnish_environment'
require 'files_api'
require 'channels_api'
require 'properties_api'
require 'tables_api'
require 'shared_resources'
require 'net_sim_api'

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
    end

    config.middleware.insert_after Rails::Rack::Logger, VarnishEnvironment
    config.middleware.insert_after VarnishEnvironment, FilesApi

    if CDO.throttle_data_apis
      require 'cdo/rack/attack'

      # Start dynamic RackAttack configuration updates.
      RackAttackConfigUpdater.new.start

      config.middleware.insert_after VarnishEnvironment, Rack::Attack
    end

    config.middleware.insert_after FilesApi, ChannelsApi
    config.middleware.insert_after ChannelsApi, PropertiesApi
    config.middleware.insert_after PropertiesApi, TablesApi
    config.middleware.insert_after TablesApi, SharedResources
    config.middleware.insert_after SharedResources, NetSimApi
    if CDO.dashboard_enable_pegasus
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
    config.i18n.available_locales = ['en']
    config.i18n.fallbacks = {}
    config.i18n.default_locale = 'en-us'
    locales = YAML.load_file("#{Rails.root}/config/locales.yml")
    LOCALES = Hash[locales.map {|k, v| [k.downcase, v.class == String ? v.downcase : v]}]
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

    config.prize_providers = YAML.load_file("#{Rails.root}/config/prize_providers.yml")

    config.assets.paths << Rails.root.join('./public/blockly')
    config.assets.paths << Rails.root.join('./public/code-studio')
    config.assets.paths << Rails.root.join('../shared/css')
    config.assets.paths << Rails.root.join('../shared/js')

    config.assets.precompile += %w(
      js/*.js
      css/*.css
      assets/**/*
      angularProjects.js
      levels/*
      jquery.handsontable.full.css
      jquery.handsontable.full.js
    )
    config.autoload_paths << Rails.root.join('lib')

    # use https://(*-)studio.code.org urls in mails
    config.action_mailer.default_url_options = { host: CDO.canonical_hostname('studio.code.org'), protocol: 'https' }

    MAX_CACHED_BYTES = 256.megabytes
    if CDO.memcached_hosts.present?
      config.cache_store = :mem_cache_store, CDO.memcached_hosts, {
          value_max_bytes: MAX_CACHED_BYTES
      }
    else
      config.cache_store = :memory_store, { size: MAX_CACHED_BYTES }
    end

  end
end
