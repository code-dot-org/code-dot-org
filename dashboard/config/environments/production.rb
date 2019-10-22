Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both thread web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Use the schema cache dump to avoid forcing every front end to fetch the schema from
  # the database. (Fetching the schema adds undesirable load and can trigger expensive
  # recomputations of schema statistics.)
  config.use_schema_cache_dump = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Enable Rack::Cache to put a simple HTTP cache in front of your application
  # Add `rack-cache` to your Gemfile before enabling this.
  # For large-scale production use, consider using a caching reverse proxy like nginx, varnish or squid.
  # config.action_dispatch.rack_cache = true

  # Serve static resources - these will be cached by Varnish (or a CDN)
  config.public_file_server.enabled = true
  config.public_file_server.headers = {'Cache-Control' => "public, max-age=86400, s-maxage=43200"}

  # Compress JavaScripts and CSS.
  # webpack handles js compression for us
  # config.assets.js_compressor = :uglifier
  # config.assets.css_compressor = :sass

  # Version of your assets, change this if you want to expire all your assets.
  config.assets.version = '1.0'

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  # config.force_ssl = true

  # Set to :debug to see everything in the log.
  config.log_level = :info

  # Prepend all log lines with the following tags.
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups.
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store

  # Precompile additional assets.
  # application.js, application.css, and all non-JS/CSS in app/assets folder are already added.

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false
  config.action_mailer.delivery_method = Poste2::DeliveryMethod

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Disable automatic flushing of the log to improve performance.
  # config.autoflush_log = false

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Log condensed lines to syslog for centralized logging.
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Cee.new
  require 'syslog/logger'
  config.logger = Syslog::Logger.new 'dashboard', Syslog::LOG_LOCAL0

  # don't act like a levelbuilder by default
  config.levelbuilder_mode = CDO.with_default(false).levelbuilder_mode

  # Whether or not to skip script preloading. Setting this to true
  # significantly speeds up server startup time
  config.skip_script_preload = false

  # The activities_old table should not be part of the schema
  # DELETE_ME when the activities old table gets removed
  ActiveRecord::SchemaDumper.ignore_tables = ["activities_old"]
end
