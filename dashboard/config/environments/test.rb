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
  config.eager_load = true

  # Use the schema cache dump to avoid forcing every front end to fetch the schema from
  # the database. (Fetching the schema adds undesirable load and can trigger expensive
  # recomputations of schema statistics.)
  config.use_schema_cache_dump = true

  # Configure static asset server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {'Cache-Control' => "public, max-age=3600, s-maxage=1800"}

  # Whether or not to display pretty apps (formerly called blockly).
  config.pretty_apps = false

  # test environment should use precompiled, minified, digested assets like production,
  # unless it's being used for unit tests.
  ci_test = !!(ENV['UNIT_TEST'] || ENV['CI'])

  unless ci_test
    # Compress JavaScripts and CSS.
    # webpack handles js compression for us
    # config.assets.js_compressor = :uglifier
    # config.assets.css_compressor = :sass

    # Do not fallback to assets pipeline if a precompiled asset is missed.
    config.assets.compile = false

    # Generate digests for assets URLs.
    config.assets.digest = true

    # Version of your assets, change this if you want to expire all your assets.
    config.assets.version = '1.0'
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

  # Disable this for test by default, it won't make much sense if we keep wiping
  # the DB.
  CDO.disable_s3_image_uploads = true

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

  # Whether or not to skip script preloading. Setting this to true
  # significantly speeds up server startup time.
  config.skip_script_preload = false

  # Overrides for Jotform Form Ids
  CDO.jotform_forms = {
    'local' => {
      'day_0' => 1,
      'day_1' => 2,
      'day_2' => 3,
      'day_3' => 4,
      'day_4' => 5,
      'day_5' => 6,
      'facilitator' => 7,
      'post_workshop' => 6
    },
    'local_summer' => {
      'day_0' => 1,
      'day_1' => 2,
      'day_2' => 3,
      'day_3' => 4,
      'day_4' => 5,
      'day_5' => 6,
      'facilitator' => 7,
      'post_workshop' => 6
    },
    'academic_year_1' => {
      'day_1' => 10,
      'facilitator' => 11,
      'post_workshop' => 12
    },
    'academic_year_2' => {
      'day_1' => 20,
      'facilitator' => 11,
      'post_workshop' => 12
    },
    'academic_year_3' => {
      'day_1' => 30,
      'facilitator' => 11,
      'post_workshop' => 12
    },
    'academic_year_4' => {
      'day_1' => 40,
      'facilitator' => 11,
      'post_workshop' => 12
    },
    'academic_year_1_2' => {
      'day_1' => 10,
      'day_2' => 20,
      'facilitator' => 11,
      'post_workshop' => 12
    },
    'academic_year_3_4' => {
      'day_1' => 30,
      'day_2' => 40,
      'facilitator' => 11,
      'post_workshop' => 12
    }
  }
end
