require File.expand_path('../router', __FILE__)

require 'varnish_environment'
use VarnishEnvironment

require 'apps_api'
use AppsApi

require 'shared_resources'
use SharedResources

run Documents
