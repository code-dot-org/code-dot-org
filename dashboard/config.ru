# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)

require 'unicorn/oob_gc'
use Unicorn::OobGC

require 'varnish_environment'
use VarnishEnvironment

require 'apps_api'
use AppsApi

require 'shared_resources'
use SharedResources

run Rails.application
