require 'cdo/db'
require 'cdo/geocoder'
require_relative '../helpers/properties'

def search_for_address(address)
  sleep(0.01)
  Geocoder.search(address).first
end

def geocode_address(address)
  location = search_for_address(address)
  return nil unless location
  return nil unless location.latitude && location.longitude
  return "#{location.longitude},#{location.latitude}"
end
