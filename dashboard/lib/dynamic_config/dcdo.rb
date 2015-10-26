# A dynamic configuration module that allows us to update
# config settings without pushing new code.

require 'digest/sha1'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'

if CDO.use_dynamo_tables
  adapter = DynamoDBAdapter.new CDO.dcdo_table_name
else
  adapter = JSONFileDatastoreAdapter.new CDO.dcdo_table_name
end

$dcdo_cache = DatastoreCache.new adapter

module DCDO
  # @param key [String]
  # @param default
  # @returns the stored value at key
  def DCDO.get(key, default)
    raise ArgumentError unless key.is_a? String

    begin
      value = $dcdo_cache.get(key)
    rescue => exc
      Honeybadger.notify(exc)
      return default
    end

    if !value.nil?
      return value
    end

    default
  end

  # Sets the value for a given key
  # @param key [String]
  # @param value [JSONable]
  def DCDO.set(key, value)
    raise ArgumentError unless key.is_a? String
    $dcdo_cache.set(key, value)
  end
end
