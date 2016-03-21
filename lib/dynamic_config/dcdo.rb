# A dynamic configuration module that allows us to update
# config settings without pushing new code.

require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'
require 'dynamic_config/adapters/memory_adapter'

class DCDOBase

  def initialize(datastore_cache)
    @datastore_cache = datastore_cache
  end

  # @param key [String]
  # @param default
  # @returns the stored value at key
  def get(key, default)
    raise ArgumentError unless key.is_a? String
    value = @datastore_cache.get(key)

    if !value.nil?
      return value
    end

    default
  end

  # Sets the value for a given key
  # @param key [String]
  # @param value [JSONable]
  def set(key, value)
    raise ArgumentError unless key.is_a? String
    @datastore_cache.set(key, value)
  end

  # Clear all stored settings
  def clear
    @datastore_cache.clear
  end

  # The datastore needs to restart the update thread
  # after a fork.
  def after_fork
    @datastore_cache.after_fork
  end

  # Returns the current dcdo config state as yaml
  # @returns [String]
  def to_yaml
    YAML.dump(@datastore_cache.all)
  end

  # Adds a listener whose on_change() method will be invoked at least
  # once whenever the configuration changes. The on_change() method
  # will be invoked on an arbitrary thread and must not block.
  def add_change_listener(listener)
    @datastore_cache.add_change_listener(listener)
  end

  # Updates the cached configuration, for testing only.
  def update_cache_for_test
    @datastore_cache.update_cache
  end

  # Factory method for creating DCDOBase objects
  # @returns [DCDOBase]
  def self.create
    env = rack_env.to_s
    env = Rails.env.to_s if defined? Rails

    cache_expiration = 5
    if env == 'test'
      adapter = MemoryAdapter.new
    elsif env == 'production'
      cache_expiration = 30
      adapter = DynamoDBAdapter.new CDO.dcdo_table_name
    else
      adapter = JSONFileDatastoreAdapter.new("#{dashboard_dir(CDO.dcdo_table_name)}_temp.json")
    end

    datastore_cache = DatastoreCache.new adapter, cache_expiration: cache_expiration
    DCDOBase.new datastore_cache
  end
end

DCDO = DCDOBase.create
