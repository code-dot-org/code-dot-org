require File.expand_path('../router', __FILE__)

if rack_env?(:development) && CDO.https_development
  require 'rack/ssl-enforcer'
  use Rack::SslEnforcer, hsts: { expires: 31536000, subdomains: false }
end

require 'varnish_environment'
use VarnishEnvironment

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
