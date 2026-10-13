require 'dynamic_config/dynamic_config_base'

# A complex implementation of dynamic configuration, which allows us to
# conditionally apply the configuration on a per-request basis.
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
class Gatekeeper < DynamicConfigBase
  # @override
  def self.cache_identifier
    CDO.gatekeeper_table_name
  end

  # @param feature [String] the name of the feature
  # @param where [Hash] a hash of conditions
  # @param default [Bool] the default value to return
  # @returns [Bool]
  def self.allows(feature, where: {}, default: false)
    rule_map = get_rule_map(feature)
    conditions = []
    conditions << where_key(where)
    conditions << where_key({}) unless where.empty?

    conditions.each do |k|
      return rule_map[k] if rule_map.key? k
    end

    default
  end

  def self.disallows(*params)
    !allows(*params)
  end

  # Sets the value for a given feature/where combo
  # @override
  # @param feature [String]
  # @param where [Hash]
  # @param value [Bool]
  def self.set(feature, where: {}, value: nil)
    raise ArgumentError, "Value must be a boolean" unless !!value == value

    rule_map = get_rule_map(feature)
    rule_map[where_key(where)] = value
    super(feature, rule_map)
  end

  # Deletes a specific where clause
  # @param feature [String]
  # @param where [Hash]
  # @returns [Bool] whether or not something was deleted
  def self.delete(feature, where: {})
    raise ArgumentError, "feature must be a string" unless feature.is_a? String

    rule_map = get_rule_map(feature)
    key = where_key(where)
    if rule_map.key? key
      rule_map.delete key
      datastore_cache.set(feature, rule_map)
      return true
    end
    false
  end

  # Returns the mapping of conditions to bool for the given feature
  # @param feature [String]
  # @returns [Hash]
  def self.get_rule_map(feature)
    json_map = datastore_cache.get(feature)
    return json_map unless json_map.nil?
    return {}
  end

  # Generates the key for the where clause
  # @param where [Hash]
  # returns [String]
  def self.where_key(where)
    Oj.dump(stringify_keys(where).sort, mode: :strict)
  end

  # Returns the hash version of gatekeeper
  def self.to_hash
    gatekeeper = {}

    datastore_cache.all.each do |feature, rules|
      gatekeeper[feature] = feature_details = []
      rules.each do |conditions, value|
        rule = {"rule" => nil}

        conditions = JSON.parse(conditions)
        unless conditions.empty?
          where_clause = {}
          rule['where'] = where_clause
          conditions.each do |property, property_value|
            where_clause[property] = property_value
          end
        end
        rule['value'] = value
        feature_details << rule
      end
    end
    gatekeeper
  end

  # Returns a set of all of the distinct feature names, for features that contain at least one rule.
  def self.feature_names
    Set.new.tap do |result|
      datastore_cache.all.each do |feature, rules|
        result << feature unless rules.blank?
      end
    end
  end

  # Returns a set of all of the script names used in rule conditions.
  def self.script_names
    property_values('script_name')
  end

  # Returns a set of all of the distinct values used in where conditions for
  # the property named `condition_property`.
  def self.property_values(condition_property)
    Set.new.tap do |result|
      datastore_cache.all.each do |_feature, rules|
        rules.each do |conditions, _value|
          JSON.parse(conditions).each do |property, value|
            result << value if property == condition_property
          end
        end
      end
    end
  end

  # Converts the current config state to a yaml string
  # @returns [String]
  # @override
  def self.to_yaml
    YAML.dump(to_hash)
  end

  private_class_method def self.stringify_keys(hsh)
    hsh.inject({}) do |hash, pair|
      hash[pair[0].to_s] = pair[1]
      hash
    end
  end
end
