# Base class to contain common functionality shared
# between DCDOBase and GatekeeperBase
class DynamicConfigBase
  def initialize(datastore_cache)
    @datastore_cache = datastore_cache
  end

  # Sets the value for a given key
  # @param key [String]
  # @param value [JSONable]
  def set(key, value)
    raise ArgumentError unless key.is_a? String
    @datastore_cache.set(key, value)
  end

  # @param key [String]
  # @param default
  # @returns the stored value at key
  def get(key, default)
    raise ArgumentError unless key.is_a? String
    value = @datastore_cache.get(key)

    unless value.nil?
      return value
    end

    default
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
end
