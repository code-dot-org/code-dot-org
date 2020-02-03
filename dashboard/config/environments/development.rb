Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false
  config.cache_store = :null_store

  # Cache assets in memory instead of on disk
  if CDO.with_default(true).cache_assets_in_memory
    config.assets.configure do |env|
      env.cache = Sprockets::Cache::MemoryStore.new(1000)
    end
  end

  # Do not eager load code on boot.
  config.eager_load = false

  # Always reload static js and css.
  config.public_file_server.headers = {'Cache-Control' => 'must-revalidate, max-age=0'}

  # Show full error reports
  config.consider_all_requests_local = true

  config.action_mailer.delivery_method = Poste2::DeliveryMethod

  # if you don't want to send mail in development. Messages will be logged in
  # development.log if you want to look at them
  #config.action_mailer.perform_deliveries = false
  #config.action_mailer.raise_delivery_errors = false

  # If you want to use mailcatcher, specify `use_mailcatcher: true` in locals.yml.
  if CDO.use_mailcatcher
    config.action_mailer.perform_deliveries = true
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {address: 'localhost', port: 1025}
  end
  # and run:
  #   `gem install mailcatcher`
  #   `mailcatcher --ip=0.0.0.0`

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  # config.assets.debug = true

  config.assets.quiet = true

  # skip precompiling of all assets on the first request for any asset.
  config.assets.check_precompiled_asset = false

  # Whether or not to skip script preloading. Setting this to true
  # significantly speeds up server startup time
  config.skip_script_preload = true

  # Set to :debug to see everything in the log.
  config.log_level = :debug

  # See stack traces around sql queries in the log.
  # ActiveRecordQueryTrace.enabled = true

  # Set "levelbuilder_mode: true" in locals.yml if you want to be able to create
  # levels or test levelbuilder functionality.
  config.levelbuilder_mode = CDO.with_default(false).levelbuilder_mode

  config.experiment_cache_time_seconds = 0
end
