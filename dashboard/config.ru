# This file is used by Rack-based servers to start the application.

require_relative '../deployment'
# Ensure all application secrets are loaded.
CDO.cdo_secrets&.required! unless rack_env?(:development)

require File.expand_path('../config/environment',  __FILE__)

use Rack::ContentLength
require 'rack/ssl-enforcer'
use Rack::SslEnforcer,
  # Add HSTS header to all HTTPS responses in all environments.
  hsts: {expires: 31_536_000, subdomains: false},
  # HTTPS redirect is handled at the HTTP-cache layer (CloudFront/Varnish).
  # The only exception is in :development, where no HTTP-cache layer is present.
  only_environments: 'development',
  # Only HTTPS-redirect in development when `https_development` is true.
  ignore: ->(request) {!request.ssl? && !CDO.https_development}
run Rails.application
