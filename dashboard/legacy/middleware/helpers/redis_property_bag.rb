# A simple property bag backed by Redis.
#
# In addition to string properties the property bag also supports
# named, atomic counters via the increment_counter call.  These can
# be used (for example) to generate ascending sequence numbers for keys.
#
# Implementation notes: The entire property bag, including its counter,
# is stored in a single value as a Redis hash. This makes it efficient to
# fetch tne entire property bag without having to make multiple requests to
# Redis. It also means all of the data in the bag is "fate shared": if any
# of the data in the property bag is lost due to a Redis node going down,
# *all* of the data will be lost. This provides some degree of consistency
# between strings and counters in the bag.

require 'redis'

class RedisPropertyBag
  # A unique prefix for Redis property bag keys.
  PROPERTY_BAG_KEY_PREFIX = '__pbag__'.freeze

  # Initializes a Redis property bag.
  #
  # @param [Redis] redis_client A Redis client instance
  # @param [String] id A unique id for the property bag.
  # @param [Number] expire_in Expiration in seconds from the last write.
  #        If omitted (or nil), property bag will not expire.
  def initialize(redis_client, id, expire_in = nil)
    @redis = redis_client
    @expire_in = expire_in
    # The redis key for storing the table.
    @key = "#{PROPERTY_BAG_KEY_PREFIX}#{id}"
  end

  # Returns value of the property with the given name, or nil
  # if no such property exists.
  #
  # @param [String] name
  # @return [String]
  def get(name)
    @redis.hget(@key, name)
  end

  # Sets the value of the property with the given name.
  #
  # @param [String] name
  # @param [String] value
  # @return [String] the set value
  def set(name, value)
    @redis.multi do |multi|
      multi.hset(@key, name, value)
      multi.expire(@key, @expire_in) if @expire_in
    end
    value
  end

  # Deletes the propert(y|ies) with the given name.
  #
  # @param [String, Array<String>] names
  # @return [Boolean] true if any of the values was present before deletion.
  def delete(names)
    return false if names.is_a?(Array) && names.empty?
    replies = @redis.multi do |multi|
      multi.hdel(@key, names)
      multi.expire(@key, @expire_in) if @expire_in
    end
    delete_count = replies.first
    delete_count > 0
  end

  # Get all the fields and values of the bag as a hash.
  #
  # @return [Hash<String, String>]
  def to_hash
    @redis.hgetall(@key)
  end

  # Delete all properties in the property bag.
  def delete_all
    @redis.del(@key)
  end

  # Atomically increments the counter with the given name
  # and returns the new value. Callers should avoid giving a counter
  # the same name as a string field, which will result in undefined
  # behavior.
  #
  # @param [String] name
  # @return [Integer] The incremented counter value.
  def increment_counter(name)
    @redis.hincrby(@key, name, 1)
  end
end
