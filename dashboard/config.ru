# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)

require 'unicorn/oob_gc'
use Unicorn::OobGC
use Rack::ContentLength
if rack_env?(:development) && CDO.https_development
  require 'rack/ssl-enforcer'
  use Rack::SslEnforcer,
      hsts: { expires: 31536000, subdomains: false }
end
run Rails.application
