require 'minitest/autorun'
require 'rack/test'
require_relative '../../deployment'
require_relative '../middleware/helpers/null_pub_sub_api'
require_relative '../middleware/helpers/redis_table'
require_relative 'fake_redis_client'
require_relative 'spy_pub_sub_api'

class RedisTableTest < Minitest::Unit::TestCase
  def test_redis_table
    redis = FakeRedisClient.new
    pubsub = SpyPubSubApi.new
    table = RedisTable.new(redis, pubsub, 'test', 'table')
    assert_equal [], table.to_a
    assert_equal nil, table.fetch(1)

    value = {'name' => 'alice', 'age' => 7, 'male' => false}
    inserted = table.insert(value)

    value_with_id = value.merge({'id' => 1})
    assert_equal value_with_id, inserted
    assert_equal [value_with_id], table.to_a
    assert_equal value_with_id, table.fetch(1)
    assert_equal [make_pubsub_event('test', 'table', {:action => 'insert', :id => 1})],
                 pubsub.publish_history

    value2 = {'foo' => 52}
    value2_with_id = value2.merge('id' => 2)
    table.insert(value2)
    assert_equal [value_with_id, value2_with_id], table.to_a
    assert_equal value2_with_id, table.fetch(2)
    assert_equal make_pubsub_event('test', 'table', {:action => 'insert', :id => 2}),
                 pubsub.publish_history[1]

    value2a = {'foo' => 53}
    value2a_with_id = value2a.merge('id' => 2)
    updated = table.update(2, value2a)
    assert_equal(value2a_with_id, updated)
    assert_equal make_pubsub_event('test', 'table', {:action => 'update', :id => 2}),
                 pubsub.publish_history[2]

    value3 = {'bar' => 3}
    value3_with_id = value3.merge('id' => 3)
    table.insert(value3)
    assert_equal(value3_with_id, table.fetch(3))
    assert_equal([value_with_id, value2a_with_id, value3_with_id], table.to_a)
    assert_equal make_pubsub_event('test', 'table', {:action => 'insert', :id => 3}),
                 pubsub.publish_history[3]

    table.delete(2)
    assert_equal([value_with_id, value3_with_id], table.to_a)
    assert_equal make_pubsub_event('test', 'table', {:action => 'delete', :id => 2}),
                 pubsub.publish_history[4]

    table.delete_all
    assert_equal([], table.to_a)
    assert_equal(nil, table.fetch(1))
    assert_equal make_pubsub_event('test', 'table', {:action => 'delete_all'}),
                 pubsub.publish_history[5]
  end

  def make_pubsub_event(channel, event, data)
    { :channel => channel, :event => event, :data => data }
  end

end
