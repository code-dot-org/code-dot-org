require 'apps_api/properties_api'

#
# AppsApi aggregates modular API components into a unified API component.
#
class AppsApi < Sinatra::Base
  
  use PropertiesApi
  
end
