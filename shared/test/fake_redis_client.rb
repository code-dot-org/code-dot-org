# A fake redis client implementation that uses a local hash.
# Note that this does not implement the entire Redis client API,
# only that portion required by the RedisPropertyBag.
class FakeRedisClient

  def initialize
    @hash = Hash.new
    @fake_time = 0
    @expirations = Hash.new
  end

  def get_hash_for_key(key)
    @hash[key] ||= {}
  end

  def hget(key, field)
    get_hash_for_key(key)[field]
  end

  def hset(key, field, value)
    get_hash_for_key(key)[field] = value
    value
  end

  def hgetall(key)
    get_hash_for_key(key).clone
  end

  def del(key)
    @hash.delete(key)
  end

  # Second argument takes a single name or array of names, to match
  # the redis-rb API.
  # @param [String] key
  # @param [String, Array<String>] fields
  # @returns [Integer] number of deleted fields
  def hdel(key, fields)
    fields = [fields] unless fields.is_a?(Array)
    # Raise on empty array; real Redis does!
    raise ArgumentError, "Can't pass empty array to hdel", caller if fields.empty?

    hash = get_hash_for_key(key)
    fields.reduce(0) do |num_deleted, field|
      num_deleted += 1 if hash.delete(field)
      num_deleted
    end
  end

  def expire(key, seconds_from_now)
    @expirations[key] = @fake_time + seconds_from_now
  end

  def hincrby(key, name, increment)
    hash = get_hash_for_key(key)
    hash[name] ||= 0  # Initialize new counters to 0.
    hash[name] += 1  # Return incremented counter.
  end

  def time_travel(seconds)
    @fake_time += seconds
    @expirations.each do |key, value|
      if @fake_time >= value
        @hash.delete(key)
        @expirations.delete(key)
      end
    end
  end
end
