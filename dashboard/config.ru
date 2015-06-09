# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)

require 'unicorn/oob_gc'
use Unicorn::OobGC
use Rack::ContentLength
unless rack_env? :production
  require 'cdo/rack/https_redirect'
  use Rack::HTTPSRedirect
end
run Rails.application
