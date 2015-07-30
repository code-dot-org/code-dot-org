require 'minitest/autorun'
require 'rack/test'
require_relative '../../deployment'
require_relative '../middleware/helpers/null_pub_sub_api'
require_relative '../middleware/helpers/redis_table'
require_relative 'fake_redis_client'
require_relative 'spy_pub_sub_api'

class RedisTableTest < Minitest::Unit::TestCase
  def test_redis_tables
    redis = FakeRedisClient.new
    pubsub = SpyPubSubApi.new

    # We take care to test multiple tables in the same shard
    # since all of those tables are combined in a single Redis key
    # and could be intermingled in the event of a bug.

    table = RedisTable.new(redis, pubsub, 'shard1', 'table')
    # Create another table in the same shard.
    table2 = RedisTable.new(redis, pubsub, 'shard1', 'table2')
    # Create a third table in a different shard.
    table3 = RedisTable.new(redis, pubsub, 'shard2', 'table2')

    assert_equal [], table.to_a
    assert_equal nil, table.fetch(1)

    value = {'name' => 'alice', 'age' => 7, 'male' => false}
    inserted = table.insert(value)

    value_table2 = {'name' => 'bob', 'age' => 12, 'male' => true}
    table2.insert(value_table2)

    value_with_id = value.merge({'id' => 1})
    value_table2_with_id = value_table2.merge({'id' => 1})

    # Each table should only see its own inserts, not others in the same shard.
    assert_equal value_with_id, inserted
    assert_equal [value_with_id], table.to_a
    assert_equal value_with_id, table.fetch(1)
    assert_equal [value_table2_with_id], table2.to_a

    # Make sure the expected pubsub events were published.
    assert_equal [make_pubsub_event('shard1', 'table', {:action => 'insert', :id => 1}),
                  make_pubsub_event('shard1', 'table2', {:action => 'insert', :id => 1})],
                 pubsub.publish_history

    value2 = {'foo' => 52}
    value2_with_id = value2.merge('id' => 2)
    table.insert(value2)
    assert_equal [value_with_id, value2_with_id], table.to_a
    assert_equal value2_with_id, table.fetch(2)
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'insert', :id => 2}),
                 pubsub.publish_history[2]

    value2a = {'foo' => 53}
    value2a_with_id = value2a.merge('id' => 2)
    updated = table.update(2, value2a)
    assert_equal(value2a_with_id, updated)
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'update', :id => 2}),
                 pubsub.publish_history[3]

    value3 = {'bar' => 3}
    value3_with_id = value3.merge('id' => 3)
    table.insert(value3)
    assert_equal(value3_with_id, table.fetch(3))
    assert_equal([value_with_id, value2a_with_id, value3_with_id], table.to_a)
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'insert', :id => 3}),
                 pubsub.publish_history[4]

    table.delete(2)
    assert_equal([value_with_id, value3_with_id], table.to_a)
    assert_equal([value_table2_with_id], table2.to_a)

    assert_equal make_pubsub_event('shard1', 'table', {:action => 'delete', :id => 2}),
                 pubsub.publish_history[5]

    # Test reset shard and make sure it doesn't affect tables in other shards.
    table3.insert(value)

    RedisTable.reset_shard('shard1', redis, pubsub)
    assert_equal([], table.to_a)
    assert_equal([], table2.to_a)
    assert_equal(nil, table.fetch(1))
    assert_equal make_pubsub_event('shard1', '', {:action => 'reset_shard'}),
                 pubsub.publish_history[7]
    assert_equal [value_with_id], table3.to_a
  end

  def make_pubsub_event(channel, event, data)
    { :channel => channel, :event => event, :data => data }
  end

end
