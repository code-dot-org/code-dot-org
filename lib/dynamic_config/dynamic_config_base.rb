require 'dynamic_config/environment_aware_dynamic_config_helper'

# Base class for a dynamic configuration module that allows us to update config
# settings without pushing new code; inherited by both DCDO and Gatekeeper.
# Mostly just a wrapper around a DatastoreCache
class DynamicConfigBase
  include Singleton

  def self.datastore_cache
    @datastore_cache ||= EnvironmentAwareDynamicConfigHelper.create_datastore_cache(cache_identifier)
  end

  def self.cache_identifier
    raise 'overwrite this to return a unique identifier for this implementation'
  end

  # Sets the value for a given key
  # @param key [String]
  # @param value [JSONable]
  def self.set(key, value)
    raise ArgumentError unless key.is_a? String
    datastore_cache.set(key, value)
  end

  # @param key [String]
  # @param default
  # @returns the stored value at key
  # @note This method is redefined in Rack::CookieDCDO to return the cookie DCDO value for testing, if it exists
  # @see Rack::CookieDCDO#modify_dcdo
  def self.get(key, default)
    raise ArgumentError unless key.is_a? String

    value = datastore_cache.get(key)
    return value unless value.nil?

    default
  end

  # Clear all stored settings
  def self.clear
    datastore_cache.clear
  end

  # Returns the current dcdo config state as yaml
  # @returns [String]
  def self.to_yaml
    YAML.dump(datastore_cache.all)
  end

  def self.to_h
    datastore_cache.all
  end

  def self.refresh
    datastore_cache.update_local_cache
  end
end
