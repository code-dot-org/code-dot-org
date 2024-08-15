require File.expand_path('../../../deployment', __FILE__)
require 'cdo/poste'
require 'rails/all'

require 'cdo/geocoder'
require 'varnish_environment'
require_relative '../legacy/middleware/files_api'
require_relative '../legacy/middleware/channels_api'
require 'shared_resources'
require_relative '../legacy/middleware/net_sim_api'
require_relative '../legacy/middleware/sound_library_api'
require_relative '../legacy/middleware/animation_library_api'

require 'bootstrap-sass'
require 'cdo/hash'
require 'cdo/i18n_backend'
require 'cdo/shared_constants'

# load and configure pycall before numpy and any other python-related gems
# can be automatically loaded just below.
require 'cdo/pycall'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Dashboard
  class Application < Rails::Application
    # Explicitly load appropriate defaults for this version of Rails.
    config.load_defaults 7.2

    config.autoload_lib(ignore: %w(assets tasks))

    # Temporarily disable some default values that we aren't yet ready for.
    # Right now, these changes to cookie functionality break projects
    #
    # TODO infra: Figure out why, fix, and reenable.
    #
    # added in Rails 5.2 (https://github.com/rails/rails/pull/28132)
    config.action_dispatch.use_authenticated_cookie_encryption = false
    # added in Rails 5.2 (https://github.com/rails/rails/pull/29263)
    config.active_support.use_authenticated_message_encryption = false
    # added in Rails 6.0 (https://github.com/rails/rails/pull/32937)
    config.action_dispatch.use_cookies_with_metadata = false

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins CDO.pegasus_site_host
        resource '/dashboardapi/*', headers: :any, methods: [:get]
      end
    end

    unless CDO.chef_managed
      # Only Chef-managed environments run an HTTP-cache service alongside the Rack app.
      # For other environments (development / CI), run the HTTP cache from Rack middleware.
      require 'cdo/rack/allowlist'
      require 'cdo/http_cache'
      config.middleware.insert_before ActionDispatch::Cookies, Rack::Allowlist::Downstream,
        HttpCache.config(rack_env)[:dashboard]

      require 'rack/cache'
      config.middleware.insert_before ActionDispatch::Cookies, Rack::Cache, ignore_headers: []

      config.middleware.insert_after Rack::Cache, Rack::Allowlist::Upstream,
        HttpCache.config(rack_env)[:dashboard]
    end

    if Rails.env.development?
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
    config.middleware.insert_after ChannelsApi, SharedResources
    config.middleware.insert_after SharedResources, NetSimApi
    config.middleware.insert_after NetSimApi, AnimationLibraryApi
    config.middleware.insert_after AnimationLibraryApi, SoundLibraryApi
    if CDO.dashboard_enable_pegasus && !ENV['SKIP_DASHBOARD_ENABLE_PEGASUS']
      require 'pegasus_sites'
      config.middleware.insert_after VarnishEnvironment, PegasusSites
    end

    require 'cdo/rack/upgrade_insecure_requests'
    config.middleware.use ::Rack::UpgradeInsecureRequests

    if CDO.use_cookie_dcdo
      # Enables the setting of DCDO via cookies for testing purposes.
      require 'cdo/rack/cookie_dcdo'
      config.middleware.insert_after ActionDispatch::RequestId, Rack::CookieDCDO
    end

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
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '*.json').to_s]
    config.i18n.backend = CDO.i18n_backend
    config.i18n.enforce_available_locales = false
    config.i18n.available_locales = [SharedConstants::DEFAULT_LOCALE]
    config.i18n.fallbacks[:defaults] = [SharedConstants::DEFAULT_LOCALE]
    config.i18n.default_locale = SharedConstants::DEFAULT_LOCALE
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

    config.after_initialize do
      # For some reason custom fallbacks need to be set on the I18n module
      # itself and can't be configured using config.i18n.fallbacks.
      # Following examples from: https://github.com/ruby-i18n/i18n/wiki/Fallbacks
      # and http://pawelgoscicki.com/archives/2015/02/enabling-i18n-locale-fallbacks-in-rails/
      I18n.fallbacks.map(es: :'es-MX')
      I18n.fallbacks.map(pt: :'pt-BR')
    end

    config.assets.gzip = false # cloudfront gzips everything for us on the fly.
    config.assets.paths << Rails.root.join('./public/blockly')
    config.assets.paths << Rails.root.join('../shared/css')
    config.assets.paths << Rails.root.join('../shared/js')

    # Whether to fallback to assets pipeline if a precompiled asset is missed.
    config.assets.compile = !CDO.optimize_rails_assets

    # Generate digests for assets URLs which do not contain webpack hashes.
    config.assets.digest = CDO.optimize_rails_assets

    config.assets.precompile += %w(
      js/*
      css/*.css
      levels/*.css
      jquery.handsontable.full.css
      emulate-print-media.js
      jquery.handsontable.full.js
      video-js/*.css
      font-awesome.css
    )

    # Support including code from directories outside of the normal Rails directory
    # structure. Specifically, include a couple of directories for misc library code, as
    # well as some subdirectories of the models dir that we use for organization.

    config.autoload_paths << Rails.root.join('lib')
    config.autoload_paths << Rails.root.join('app', 'models', 'experiments')
    config.autoload_paths << Rails.root.join('app', 'models', 'levels')
    config.autoload_paths << Rails.root.join('app', 'models', 'sections')
    config.autoload_paths << Rails.root.join('../lib/cdo/shared_constants')

    # Make sure to explicitly cast all autoload paths to strings; the gem we use to
    # annotate model files with schema descriptions doesn't know how to deal with
    # Pathnames. See https://github.com/ctran/annotate_models/issues/758
    #
    # We have a PR opened with a fix at https://github.com/ctran/annotate_models/pull/848;
    # once a version of the gem is released which includes that change, we can get rid of
    # this line.
    config.autoload_paths.map!(&:to_s)

    # Also make sure some of these directories are always loaded up front in production
    # environments.
    #
    # These directories will also be treated as top-level directories by
    # Zeitwerk, rather than as subdirectories which require namspacing.
    config.eager_load_paths += [
      Rails.root.join('app', 'models', 'experiments'),
      Rails.root.join('app', 'models', 'levels'),
      Rails.root.join('app', 'models', 'sections')
    ].map(&:to_s)

    # use https://(*-)studio.code.org urls in mails
    config.action_mailer.default_url_options = {host: CDO.canonical_hostname('studio.code.org'), protocol: 'https'}
    config.action_mailer.deliver_later_queue_name = CDO.active_job_queues[:mailers]
    Rails.application.config.to_prepare do
      config.action_mailer.delivery_job = 'MailDeliveryJob'
    end

    # Rails.cache is a fast memory store, cleared every time the application reloads.
    config.cache_store = :memory_store, {
      size: 256.megabytes # max size of entire store
    }

    # Sprockets file cache limit must be greater than precompiled-asset total to prevent thrashing.
    config.assets.cache_limit = 1.gigabyte

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

    # Use custom routes for error codes
    config.exceptions_app = routes

    config.active_job.queue_adapter = CDO.active_job_queue_adapter
    config.active_job.default_queue_name = CDO.active_job_queues[:default]
  end
end
