# A module that allows us to dynamically turn on and off
# features without requiring a code push.

require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'
require 'dynamic_config/adapters/memory_adapter'

class GatekeeperBase
  def initialize(datastore_cache)
    @datastore_cache = datastore_cache
  end

  # @param feature [String] the name of the feature
  # @param where [Hash] a hash of conditions
  # @param default [Bool] the default value to return
  # @returns [Bool]
  def allows(feature, where: {}, default: false)
    rule_map = get_rule_map(feature)
    conditions = []
    conditions << where_key(where)
    conditions << where_key({}) if !where.empty?

    conditions.each do |k|
      return rule_map[k] if rule_map.key? k
    end

    default
  end

  # Sets the value for a given feature/where combo
  # @param feature [String]
  # @param where [Hash]
  # @param value [Bool]
  def set(feature, where: {}, value: nil)
    raise ArgumentError, "feature must be a string" unless feature.is_a? String
    raise ArgumentError, "Value must be a boolean" unless !!value == value

    rule_map = get_rule_map(feature)
    rule_map[where_key(where)] = value
    @datastore_cache.set(feature, rule_map)
  end

  # Returns the mapping of conditions to bool for the given feature
  # @param feature [String]
  # @returns [Hash]
  def get_rule_map(feature)
    json_map = @datastore_cache.get(feature)
    return json_map if !json_map.nil?
    return {}
  end

  # Generates the key for the where clause
  # @param where [Hash]
  # returns [String]
  def where_key(where)
    Oj.dump(where.stringify_keys.sort, :mode => :strict)
  end

  # Clear all stored settings
  def clear
    @datastore_cache.clear
  end

  # Factory method for creating GatekeeperBase objects
  # @returns [GatekeeperBase]
  def self.create
    if Rails.env.test?
      adapter = MemoryAdapter.new
    elsif CDO.use_dynamo_tables
      adapter = DynamoDBAdapter.new CDO.gatekeeper_table_name
    else
      adapter = JSONFileDatastoreAdapter.new CDO.gatekeeper_table_name
    end

    datastore_cache = DatastoreCache.new adapter
    GatekeeperBase.new datastore_cache
  end
end

Gatekeeper = GatekeeperBase.create()
