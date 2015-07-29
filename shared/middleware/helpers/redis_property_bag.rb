# A property bag implementation backed by Redis.

# Implementation notes:  The entire property bag is stored in a single
# value as a Redis hash. This makes it efficient to fetch tne entire property
# bag without having to make multiple requests to Redis.

require 'sinatra/base'
require 'redis'

class RedisPropertyBag

  class NotFound < Sinatra::NotFound
  end

  # Initializes a Redis property bag.
  #
  # @param [Redis] redis_client A Redis client instance
  # @param [String] key A unique id for the property bag.
  def initialize(redis_client, id)
    @redis = redis_client
    # The redis key for storing the table.
    @key = "_pbag_#{id}"
  end

  # Get all the fields and values in a hash.
  #
  # @return [Hash<String, String>]
  def to_hash()
    @redis.hgetall(@key)
  end

  # Returns a collection of all of the items in the property bag, representing each entry
  # as a hash with "name" and "value" keys.
  #
  # @return Array<Hash<String, String>>
  def items()
    to_hash.collect {|k, v| {name: k, value: v}}
  end

  # Deletes the property with the given name.
  #
  # @raise NotFound if the given key does not exist
  def delete(name)
    delete_count = @redis.hdel(@key, name)
    if delete_count > 0
      return true
    else
      raise NotFound, "property `#{name}` not found"
    end
  end

  # Returns value of the property with the given name.
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
  def set(name, value, ignored=nil)
    @redis.hset(@key, name, value)
    return value
  end

end
