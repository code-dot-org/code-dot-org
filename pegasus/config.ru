require File.expand_path('../router', __FILE__)

require 'rack/csrf'
use Rack::Session::Cookie, secret: (CDO.sinatra_session_secret || 'dev_mode')
use Rack::Csrf, check_only: ['POST:/v2/poste/send-message']

require 'rack/ssl-enforcer'
use Rack::SslEnforcer,
  # Add HSTS header to all HTTPS responses in all environments.
  hsts: { expires: 31_536_000, subdomains: false },
  # HTTPS redirect is handled at the HTTP-cache layer (CloudFront/Varnish).
  # The only exception is in :development, where no HTTP-cache layer is present.
  only_environments: 'development',
  # Only HTTPS-redirect in development when `https_development` is true.
  ignore: lambda {|request| !request.ssl? && !CDO.https_development }

require 'varnish_environment'
use VarnishEnvironment

if rack_env?(:development)
  require 'cdo/rack/whitelist'
  require File.expand_path('../../cookbooks/cdo-varnish/libraries/http_cache', __FILE__)
  use Rack::Whitelist::Downstream,
    HttpCache.config(rack_env)[:pegasus]

  require 'rack/cache'
  use Rack::Cache, ignore_headers: []

  use Rack::Whitelist::Upstream,
    HttpCache.config(rack_env)[:pegasus]
end

if CDO.throttle_data_apis
  require 'cdo/rack/attack'
  RackAttackConfigUpdater.new.start
  use Rack::Attack
end

require 'files_api'
use FilesApi

require 'channels_api'
use ChannelsApi

require 'properties_api'
use PropertiesApi

require 'tables_api'
use TablesApi

require 'shared_resources'
use SharedResources

run Documents
