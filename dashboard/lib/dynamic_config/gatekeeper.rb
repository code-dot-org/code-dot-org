require 'digest/sha1'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'

if CDO.use_dynamo_tables
  adapter = DynamoDBAdapter.new(CDO.gatekeeper_table_name)
else
  adapter = JSONFileDatastoreAdapter.new "gatekeeper_#{Rails.env}"
end

$gatekeeper_cache = DatastoreCache.new adapter

module Gatekeeper
  #
  # @param feature [String] the name of the feature
  # @param where [Hash] a hash of clauses
  # @param default [Bool] the default value to return
  # @returns [Bool]
  def Gatekeeper.allows(feature, where: {}, default: false)
    keys = []
    keys << Gatekeeper.key(feature, where: where) if !where.empty?
    keys << Gatekeeper.key(feature, where: {})

    keys.each do |key|
      value = $gatekeeper_cache.get(key)
      if !value.nil?
        return value
      end
    end

    default
  end

  # Sets the value for a given feature/where combo
  # @param feature [String]
  # @param where [Hash]
  # @param value [Bool]
  def Gatekeeper.set(feature, where: {}, value: nil)
    raise ArgumentError, "Value must be a boolean" unless !!value == value

    key = Gatekeeper.key(feature, where: where)
    $gatekeeper_cache.set(key, value)
  end

  # Generate a key for params
  # @param feature [String]
  # @param where [Hash]
  # @returns [String]
  def Gatekeeper.key(feature, where: {})
    feature_hash = Digest::SHA1.hexdigest feature
    where_hash = Digest::SHA1.hexdigest where.sort.to_json
    "GK:#{feature_hash}:#{where_hash}"
  end
end
