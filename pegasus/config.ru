require_relative '../deployment'
# Ensure all application secrets are loaded.
CDO.cdo_secrets&.required! unless rack_env?(:development) || CDO.unit_test

require File.expand_path('../router', __FILE__)

unless rack_env?(:development)
  require 'cdo/app_server_metrics'
  listener = CDO.pegasus_sock || "0.0.0.0:#{CDO.pegasus_port}"
  use Cdo::AppServerMetrics,
    listeners: [listener],
    dimensions: {
      Environment: CDO.rack_env,
      Host: CDO.pegasus_hostname
    }
end

use Rack::Session::Cookie, secret: (CDO.sinatra_session_secret || 'dev_mode')

require 'rack/ssl-enforcer'
use Rack::SslEnforcer,
  # Add HSTS header to all HTTPS responses in all environments.
  hsts: {expires: 31_536_000, subdomains: false},
  # HTTPS redirect is handled at the HTTP-cache layer (CloudFront/Varnish).
  # The only exception is in :development, where no HTTP-cache layer is present.
  only_environments: 'development',
  # Only HTTPS-redirect in development when `https_development` is true.
  ignore: ->(request) {!request.ssl? && !CDO.https_development}

require 'varnish_environment'
use VarnishEnvironment

unless CDO.chef_managed
  # Only Chef-managed environments run an HTTP-cache service alongside the Rack app.
  # For other environments (development / CI), run the HTTP cache from Rack middleware.
  require 'cdo/rack/allowlist'
  require 'cdo/http_cache'
  use Rack::Allowlist::Downstream,
    HttpCache.config(rack_env)[:pegasus]

  require 'rack/cache'
  use Rack::Cache, ignore_headers: []

  use Rack::Allowlist::Upstream,
    HttpCache.config(rack_env)[:pegasus]
end

if CDO.image_optim
  require 'cdo/rack/optimize'
  use Rack::Optimize
end

if CDO.use_cookie_dcdo
  # Enables the setting of DCDO via cookies for testing purposes.
  require 'cdo/rack/cookie_dcdo'
  use Rack::CookieDCDO
end

# Disable Sinatra auto-initialization.
# Add Honeybadger::Rack::ErrorNotifier to Rack middleware directly.
use Honeybadger::Rack::ErrorNotifier

require 'shared_resources'
use SharedResources

run Documents
