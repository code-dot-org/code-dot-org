# A simple property bag backed by Redis.
#
# Implementation notes:  The entire property bag is stored in a single
# value as a Redis hash. This makes it efficient to fetch tne entire property
# bag without having to make multiple requests to Redis.

require 'redis'

class RedisPropertyBag

  # A unique prefix for Redis property bag keys.
  PROPERTY_BAG_KEY_PREFIX = '__pbag__'

  # Initializes a Redis property bag.
  #
  # @param [Redis] redis_client A Redis client instance
  # @param [String] id A unique id for the property bag.
  def initialize(redis_client, id)
    @redis = redis_client
    # The redis key for storing the table.
    @key = "#{PROPERTY_BAG_KEY_PREFIX}#{id}"
  end

  # Returns value of the property with the given name, or nil
  # if no such property exists.
  #
  # @param {String} name
  # @return {String}
  def get(name)
    @redis.hget(@key, name)
  end

  # Sets the value of the property with the given name.
  #
  # @param {String} name
  # @param {String} value
  # @return {String} the set value
  def set(name, value)
    @redis.hset(@key, name, value)
    value
  end

  # Deletes the property with the given name.
  #
  # @param {String} name
  # @return {Boolean} true if the value was present before deletion.
  def delete(name)
    delete_count = @redis.hdel(@key, name)
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

end
