Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # We sometimes use Spring in test, so want to enable live reloading if and
  # only if this is an environment in which Spring is running
  # https://guides.rubyonrails.org/configuring.html#config-cache-classes
  # https://stackoverflow.com/a/70566038/1810460
  # https://github.com/rails/spring/issues/598#issuecomment-1268885973
  config.cache_classes = !(defined?(Spring::Env) && Spring::Env.new.server_running?)

  # Do not eager load code on boot. This avoids loading your whole application
  # just for the purpose of running a single test. If you are using a tool that
  # preloads Rails for running tests, you may have to set it to true.
  config.eager_load = true

  # Configure static asset server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {'Cache-Control' => "public, max-age=3600, s-maxage=1800"}

  is_ci = !!ENV.fetch('CI', nil)

  # test environment should use precompiled, minified, digested assets like production,
  # unless it's being used for unit tests.
  ci_test = !!(ENV['UNIT_TEST'] || is_ci)

  unless ci_test
    # Compress JavaScripts and CSS.
    # webpack handles js compression for us
    # config.assets.js_compressor = :uglifier
    # config.assets.css_compressor = :sass

    # Version of your assets, change this if you want to expire all your assets.
    config.assets.version = '1.0'

    # Avoid loading all i18n files up front, which can significantly slow down initialization.
    # Instead, it only loads i18n files that belong to the current locale.
    config.i18n.backend = Cdo::I18n::LazyLoadableBackend.new(lazy_load: true)
  end

  # In CI environments (ie, Drone), stub relevant AWS services (currently just SageMaker)
  # so we can run UI tests for our AI Chat (ie, Generative AI) lab.
  if is_ci
    config.stub_aichat_aws_services = true
  end

  config.assets.quiet = true

  # Show full error reports and disable caching.
  config.consider_all_requests_local = true
  config.action_controller.perform_caching = false

  # Disable Rails.cache when running unit tests.
  config.cache_store = :memory_store, {size: 64.megabytes} if ci_test

  # config.action_mailer.raise_delivery_errors = true
  # config.action_mailer.delivery_method = :smtp

  # Show mail previews (rails/mailers).
  # See http://edgeguides.rubyonrails.org/action_mailer_basics.html#previewing-emails
  config.action_mailer.show_previews = true

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = true

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # See stack traces around SQL queries in the log. Off by default because it
  # slows things down.
  ActiveRecordQueryTrace.enabled = false

  # Explicitly set legacy test-order behavior in Rails 4.2.
  # See http://guides.rubyonrails.org/upgrading_ruby_on_rails.html#ordering-of-test-cases
  config.active_support.test_order = :sorted

  # Don't act like a levelbuilder by default.
  config.levelbuilder_mode = CDO.with_default(false).levelbuilder_mode

  # Set to :debug to see everything in the log.
  config.log_level = :info

  if CDO.running_web_application?
    # Use default logging formatter so that PID and timestamp are not suppressed.
    config.log_formatter = Logger::Formatter.new

    # Log condensed lines to syslog for centralized logging.
    config.lograge.enabled = true
    config.lograge.formatter = Lograge::Formatters::Cee.new
    require 'syslog/logger'
    config.logger = Syslog::Logger.new 'dashboard', Syslog::LOG_LOCAL0
  end

  config.experiment_cache_time_seconds = 0
end
