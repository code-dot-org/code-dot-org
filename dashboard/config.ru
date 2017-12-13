# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)

unless rack_env?(:development)
  require 'cdo/unicorn_listener'
  use Cdo::UnicornListener
end

require 'gctools/oobgc/unicorn_middleware'
use GC::OOB::UnicornMiddleware
use Rack::ContentLength
require 'rack/ssl-enforcer'
use Rack::SslEnforcer,
  # Add HSTS header to all HTTPS responses in all environments.
  hsts: {expires: 31_536_000, subdomains: false},
  # HTTPS redirect is handled at the HTTP-cache layer (CloudFront/Varnish).
  # The only exception is in :development, where no HTTP-cache layer is present.
  only_environments: 'development',
  # Only HTTPS-redirect in development when `https_development` is true.
  ignore: lambda {|request| !request.ssl? && !CDO.https_development}
run Rails.application
