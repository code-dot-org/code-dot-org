Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = true

  # Don't try to send mail in development. Messages will be logged in
  # development.log if you want to look at them
  config.action_mailer.perform_deliveries = false
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.default_url_options = { :host => 'localhost:3000' }

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

  # Whether or not to display pretty blockly.
  config.pretty_blockly = true
end
