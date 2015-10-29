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

  # Factory method for creating DCDOBase objects
  # @returns [DCDOBase]
  def self.create
    if Rails.env.test?
      adapter = MemoryAdapter.new
    elsif Rails.env.development
      adapter = JSONFileDatastoreAdapter.new CDO.gatekeeper_table_name
    else
      adapter = DynamoDBAdapter.new CDO.gatekeeper_table_name
    end

    datastore_cache = DatastoreCache.new adapter
    DCDOBase.new datastore_cache
  end
end

DCDO = DCDOBase.create
