# A module that allows us to dynamically turn on and off
# features without requiring a code push.

require 'oj'
require 'digest/sha1'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'

if CDO.use_dynamo_tables
  adapter = DynamoDBAdapter.new CDO.gatekeeper_table_name
else
  adapter = JSONFileDatastoreAdapter.new CDO.gatekeeper_table_name
end

$gatekeeper_cache = DatastoreCache.new adapter

module Gatekeeper
  # @param feature [String] the name of the feature
  # @param where [Hash] a hash of conditions
  # @param default [Bool] the default value to return
  # @returns [Bool]
  def Gatekeeper.allows(feature, where: {}, default: false)
    rule_map = Gatekeeper.get_rule_map(feature)
    conditions = []
    conditions << Gatekeeper.where_key(where)
    conditions << Gatekeeper.where_key({}) if !where.empty?

    conditions.each do |k|
      return rule_map[k] if rule_map.key? k
    end

    default
  end

  # Sets the value for a given feature/where combo
  # @param feature [String]
  # @param where [Hash]
  # @param value [Bool]
  def Gatekeeper.set(feature, where: {}, value: nil)
    raise ArgumentError, "feature must be a string" unless feature.is_a? String
    raise ArgumentError, "Value must be a boolean" unless !!value == value

    rule_map = Gatekeeper.get_rule_map(feature)
    rule_map[Gatekeeper.where_key(where)] = value
    $gatekeeper_cache.set(feature, rule_map)
  end

  # Returns the mapping of conditions to bool for the given feature
  # @param feature [String]
  # @returns [Hash]
  def Gatekeeper.get_rule_map(feature)
    json_map = $gatekeeper_cache.get(feature)
    return json_map if !json_map.nil?
    return {}
  end

  # Generates the key for the where clause
  # @param where [Hash]
  # returns [String]
  def Gatekeeper.where_key(where)
    Oj.dump(where.stringify_keys.sort, :mode => :strict)
  end
end
