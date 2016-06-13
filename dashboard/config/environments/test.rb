Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # The test environment is used exclusively to run your application's
  # test suite. You never need to work with it otherwise. Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs. Don't rely on the data there!
  config.cache_classes = true

  # Do not eager load code on boot. This avoids loading your whole application
  # just for the purpose of running a single test. If you are using a tool that
  # preloads Rails for running tests, you may have to set it to true.
  config.eager_load = false

  # Use the schema cache dump to avoid forcing every front end to fetch the schema from
  # the database. (Fetching the schema adds undesirable load and can trigger expensive
  # recomputations of schema statistics.)
  config.use_schema_cache_dump = true

  # Configure static asset server for tests with Cache-Control for performance.
  config.serve_static_files  = true
  config.static_cache_control = "public, max-age=3600, s-maxage=1800"

  # test environment should use precompiled digested assets like production,
  # unless it's being used for unit tests.
  ci_test = !!(ENV['UNIT_TEST'] || ENV['CI'])

  unless ci_test
    # Compress JavaScripts and CSS.
    config.assets.js_compressor = :uglifier
    # config.assets.css_compressor = :sass

    # Do not fallback to assets pipeline if a precompiled asset is missed.
    config.assets.compile = false

    # Generate digests for assets URLs.
    config.assets.digest = true

    # Version of your assets, change this if you want to expire all your assets.
    config.assets.version = '1.0'
  end

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

#  config.action_mailer.raise_delivery_errors = true
#  config.action_mailer.delivery_method = :smtp

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

  # Whether or not to display pretty apps (formerly called blockly).
  config.pretty_apps = false

  # Whether or not to display pretty shared js assets
  config.pretty_sharedjs = false

  # disable this for test by default, it won't make much sense if we keep wiping the db
  CDO.disable_s3_image_uploads = true

  # see stack traces around sql queries in the log
  # off by default because it slows things down
  ActiveRecordQueryTrace.enabled = false

  # Explicitly set legacy test-order behavior in Rails 4.2
  # See http://guides.rubyonrails.org/upgrading_ruby_on_rails.html#ordering-of-test-cases
  config.active_support.test_order = :sorted

  # don't act like a levelbuilder by default
  config.levelbuilder_mode = CDO.with_default(false).levelbuilder_mode

  # Set to :debug to see everything in the log.
  config.log_level = :info
end
