require File.expand_path('../router', __FILE__)

require 'varnish_environment'
use VarnishEnvironment

require 'channels_api'
use ChannelsApi

require 'properties_api'
use PropertiesApi

require 'tables_api'
use TablesApi

require 'shared_resources'
use SharedResources

run Documents
