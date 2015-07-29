require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/helpers/redis_property_bag', __FILE__

class RedisPropertyBagTest < Minitest::Unit::TestCase

  def test_property_bags
    redis = create_local_redis()

    uniquifier = Random.rand()
    bag1 = RedisPropertyBag.new(redis, "bag1_#{uniquifier}")
    bag2 = RedisPropertyBag.new(redis, "bag2_#{uniquifier}}")

    assert_nil bag1.get("foo")
    assert_equals {}, bag1.to_hash
    assert_equals [], bag1.items

    bag1.set("foo", "value")
    assert_equal "value", bag1.get("foo")
    assert_nil bag2.get("foo")

    bag1.set("foo", "updated_value")
    assert_equal  "updated_value", bag1.get("foo")

  end

  # Create a real Redis client running against a server on localhost.
  def create_local_redis
    Redis.new({host: "localhost"})
  end

end