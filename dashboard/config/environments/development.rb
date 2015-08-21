Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports
  config.consider_all_requests_local       = true

  config.action_controller.perform_caching = true
  if CDO.memcached_hosts.present?
    config.cache_store = :mem_cache_store, CDO.memcached_hosts, {
      value_max_bytes: 1024 * 1024 * 64
    }
  else
    config.cache_store = :memory_store, { size: 64.megabytes }
  end

  config.action_mailer.delivery_method = Poste2::DeliveryMethod

  # if you don't want to send mail in development. Messages will be logged in
  # development.log if you want to look at them
  #config.action_mailer.perform_deliveries = false
  #config.action_mailer.raise_delivery_errors = false

  # if you want to use mailcatcher, use these options instead:
  # config.action_mailer.perform_deliveries = true
  # config.action_mailer.delivery_method = :smtp
  # config.action_mailer.smtp_settings = { address: 'localhost', port: 1025 }
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
  config.assets.debug = true

  # Whether or not to display pretty apps (formerly called blockly).
  config.pretty_apps = true

  # Whether or not to display pretty shared js assets
  config.pretty_sharedjs = true

  # disable this for developers by default, it won't make much sense because we have our own db
  CDO.disable_s3_image_uploads = true
#  CDO.disable_s3_image_uploads = false

  # Set to :debug to see everything in the log.
  config.log_level = :debug

  # see stack traces around sql queries in the log
  # ActiveRecordQueryTrace.enabled = true
end
