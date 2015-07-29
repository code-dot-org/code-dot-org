# Unit tests for the RedisPropertyBag.
# This uses a fake Redis service by default, but can be configured to use a
# real instance on localhost by setting the USE_REAL_REDIS environment variable;
# e.g. "USE_REAL_REDIS=true ruby test_redis_property_bag.rb".

require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/helpers/redis_property_bag', __FILE__

class RedisPropertyBagTest < Minitest::Unit::TestCase

  def test_property_bags

    # Create a redis client.
    # If the USE_REAL_REDIS environment variable is true, creates a real client
    # running against localhost, otherwise creates a fake client.
    redis = ENV['USE_REAL_REDIS'] ?
        Redis.new({host: 'localhost'}) :
        FakeRedisClient.new

    # A unique suffix to ensure that each run uses a fresh key when running
    # against real Redis.
    suffix = Random.rand
    bag1 = RedisPropertyBag.new(redis, "bag1_#{suffix}")
    bag2 = RedisPropertyBag.new(redis, "bag2_#{suffix}")

    # Make sure the bag initially has nothing in it.
    assert_nil bag1.get('foo')
    empty_hash = {}
    assert_equal empty_hash, bag1.to_hash

    # Set a value and make sure we can fetch it correctly
    bag1.set('foo', 'value')
    assert_equal 'value', bag1.get('foo')
    assert_equal({'foo' => 'value'}, bag1.to_hash)

    # The second bag should still be empty though.
    assert_nil bag2.get('foo')

    # Make sure value updates work correctly
    bag1.set('added', 'added value')
    bag1.set('foo', 'updated_value')
    assert_equal 'updated_value', bag1.get('foo')
    assert_equal 'added value', bag1.get('added')
    assert_equal({'foo' => 'updated_value', 'added' => 'added value'}, bag1.to_hash)

    bag2.set('foo', '2')
    assert_equal '2', bag2.get('foo')

    # Test deletes.
    assert_equal true, bag1.delete('foo'),
                 'Deleting existing item should return true'
    assert_equal({'added' => 'added value'}, bag1.to_hash)
    assert_equal true, bag1.delete('added')
    assert_equal(empty_hash, bag1.to_hash)

    assert_equal false, bag1.delete('added'),
                 'Deleting non existent item should return false'

    # Test the delete all functionality.
    bag1.delete_all
    assert_nil bag1.get('foo')
    assert_equal empty_hash, bag1.to_hash 

    # Test increment_counter.
    assert_equal 1, bag2.increment_counter("foo_counter")
    assert_equal 1, bag2.increment_counter("bar_counter")
    assert_equal 2, bag2.increment_counter("foo_counter")
    assert_equal 3, bag2.increment_counter("foo_counter")
    assert_equal 2, bag2.increment_counter("bar_counter")
  end

end

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
    hash[name] += 1
    return hash[name]
  end

end
