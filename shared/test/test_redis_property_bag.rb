# Unit tests for the RedisPropertyBag.
# This uses a fake Redis service by default, but can be configured to use a
# real instance on localhost by setting the USE_REAL_REDIS environment variable;
# e.g. "USE_REAL_REDIS=true ruby test_redis_property_bag.rb".

require_relative 'test_helper'
require_relative '../middleware/helpers/redis_property_bag'
require_relative 'fake_redis_client'

class RedisPropertyBagTest < Minitest::Test

  def setup
    # Create a redis client.
    # If the USE_REAL_REDIS environment variable is true, creates a real client
    # running against localhost, otherwise creates a fake client.
    @redis = ENV['USE_REAL_REDIS'] ?
        Redis.new({host: 'localhost'}) :
        FakeRedisClient.new

    # A unique suffix to ensure that each run uses a fresh key when running
    # against real Redis.
    @suffix = Random.rand
  end

  def test_property_bags
    bag1 = RedisPropertyBag.new(@redis, "bag1_#{@suffix}")
    bag2 = RedisPropertyBag.new(@redis, "bag2_#{@suffix}")

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
    assert_equal 1, bag2.increment_counter('foo_counter')
    assert_equal 1, bag2.increment_counter('bar_counter')
    assert_equal 2, bag2.increment_counter('foo_counter')
    assert_equal 3, bag2.increment_counter('foo_counter')
    assert_equal 2, bag2.increment_counter('bar_counter')
  end

  def test_delete_many
    # Make two bags to ensure delete_many on one bag does not affect the other.
    bag1 = RedisPropertyBag.new(@redis, "bag1_#{@suffix}")
    bag2 = RedisPropertyBag.new(@redis, "bag2_#{@suffix}")

    # Set a value and make sure we can fetch it correctly
    bag1.set('foo1', 'value1')
    bag1.set('foo2', 'value2')
    bag1.set('foo3', 'value3')
    bag2.set('foo1', 'value1')
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag1.to_hash)
    assert_equal({'foo1' => 'value1'}, bag2.to_hash)

    # Perform a multiple-delete operation and check the result
    bag1.delete(['foo1', 'foo3'])
    assert_equal({'foo2' => 'value2'}, bag1.to_hash)
    assert_equal({'foo1' => 'value1'}, bag2.to_hash)

    # Empty delete is safe
    bag1.delete([])

    # Clean up
    bag1.delete_all
    bag2.delete_all

  end

  def test_expire
    # Set an expiration time
    test_delay_seconds = 1
    bag = RedisPropertyBag.new(@redis, "bag_#{@suffix}", test_delay_seconds)

    # Set some values
    bag.set('foo1', 'value1')
    bag.set('foo2', 'value2')
    bag.set('foo3', 'value3')
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Make sure the bag contents are still intact
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Jump to just before expiration
    time_travel test_delay_seconds - 0.1
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Jump forward in time to expiration
    time_travel 0.2 # 0.1s margin of error for real redis
    assert_equal({}, bag.to_hash)
  end

  def test_deferred_expiration
    # Set an expiration time
    test_delay_seconds = 1
    bag = RedisPropertyBag.new(@redis, "bag_#{@suffix}", test_delay_seconds)

    # Set some values
    bag.set('foo1', 'value1')
    bag.set('foo2', 'value2')
    bag.set('foo3', 'value3')
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Make sure the bag contents are still intact
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Jump to just before expiration
    time_travel test_delay_seconds - 0.1
    assert_equal({'foo1' => 'value1', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Perform a write to reset the expire time
    bag.set('foo1', 'value4')
    assert_equal({'foo1' => 'value4', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Jump forward in time to original expiration
    time_travel 0.1
    assert_equal({'foo1' => 'value4', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Jump to just before new expiration
    time_travel test_delay_seconds - 0.2
    assert_equal({'foo1' => 'value4', 'foo2' => 'value2', 'foo3' => 'value3'}, bag.to_hash)

    # Perform a delete to reset the expire time
    bag.delete(['foo2'])
    assert_equal({'foo1' => 'value4', 'foo3' => 'value3'}, bag.to_hash)

    # Jump forward in time to original expiration
    time_travel 0.1
    assert_equal({'foo1' => 'value4', 'foo3' => 'value3'}, bag.to_hash)

    # Jump to just before new expiration
    time_travel test_delay_seconds - 0.2
    assert_equal({'foo1' => 'value4', 'foo3' => 'value3'}, bag.to_hash)

    # Jump forward in time to new expiration
    time_travel 0.2 # 0.1s margin of error for real redis
    assert_equal({}, bag.to_hash)
  end

  private

  def time_travel(seconds)
    if ENV['USE_REAL_REDIS']
      sleep seconds
    else
      @redis.time_travel seconds
    end
  end

end
