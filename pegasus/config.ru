require File.expand_path('../router', __FILE__)

require 'shared_resources'
use SharedResources

require 'apps_api'
use AppsApi

run Documents
