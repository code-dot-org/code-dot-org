# The adhoc environment extends the staging environment.
# It is used for testing a branch in a staging-like environment with
# a local database and a load balancer.
require Rails.root.join('config/environments/staging')

Dashboard::Application.configure do
  # Show full error reports
  config.consider_all_requests_local       = true

  # Use digests.
  config.assets.digest = true

  config.action_controller.perform_caching = true
  config.serve_static_files = true
  config.static_cache_control = "public, max-age=86400"

  config.asset_host = 'adhoc-studio.code.org'

  # DO not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # Version of your assets, change this if you want to expire all your assets.
  config.assets.version = '1.0'

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found).
  config.i18n.fallbacks = true

  # Whether or not to display pretty apps (formerly called blockly).
  config.pretty_apps = true

  # Whether or not to display pretty shared js assets
  config.pretty_sharedjs = true
end
