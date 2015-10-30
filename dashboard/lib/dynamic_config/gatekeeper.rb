# A module that allows us to dynamically turn on and off
# features without requiring a code push.
#
# Basic usage:
# if Gatekeeper.allows("new-tutorial", default: false)
#   # shows the new tutorial
# else
#   # raise a 403
# end
#
# Advanced usage:
# You can also pass conditions that allow for more complex
# configuration of access.  For example:
#
# if Gatekeeper.allows("feature-sharing", where: { script_id: @script.id }, default: false)
#
# This allows you to turn on feature-sharing for specific scripts

require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'
require 'dynamic_config/adapters/memory_adapter'

class GatekeeperBase
  attr_reader :datastore_cache

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
    cache_expiration = 30
    if Rails.env.test?
      adapter = MemoryAdapter.new
    elsif Rails.env.development? || Rails.env.adhoc?
      cache_expiration = 5
      adapter = JSONFileDatastoreAdapter.new CDO.gatekeeper_table_name
    else
      adapter = DynamoDBAdapter.new CDO.gatekeeper_table_name
    end

    datastore_cache = DatastoreCache.new adapter, cache_expiration: cache_expiration
    GatekeeperBase.new datastore_cache
  end
end

Gatekeeper = GatekeeperBase.create()
