# A fake redis client implementation that uses a local hash.
# Note that this does not implement the entire Redis client API,
# only that portion required by the RedisPropertyBag.
class FakeRedisClient

  def initialize
    @hash = Hash.new
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

  def hdel(key, field)
    value = get_hash_for_key(key).delete(field)
    value ? 1 : 0
  end

  def hincrby(key, name, increment)
    hash = get_hash_for_key(key)
    hash[name] ||= 0  # Initialize new counters to 0.
    hash[name] += 1  # Return incremented counter.
  end

end
