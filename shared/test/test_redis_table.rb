require_relative 'test_helper'
require 'helpers/null_pub_sub_api'
require 'helpers/redis_table'
require_relative 'fake_redis_client'
require_relative 'spy_pub_sub_api'

class RedisTableTest < Minitest::Test

  def setup
    @redis = FakeRedisClient.new
    @pubsub = SpyPubSubApi.new
  end

  def test_redis_tables
    # We take care to test multiple tables in the same shard
    # since all of those tables are combined in a single Redis key
    # and could be intermingled in the event of a bug.

    table = RedisTable.new(@redis, @pubsub, 'shard1', 'table')
    # Create another table in the same shard.
    table2 = RedisTable.new(@redis, @pubsub, 'shard1', 'table2')
    # Create a third table in a different shard.
    table3 = RedisTable.new(@redis, @pubsub, 'shard2', 'table2')

    assert_equal [], table.to_a
    assert_raises(RedisTable::NotFound) { table.fetch(1) }
    assert_raises(RedisTable::NotFound) { table.update(1, {}) }

    value = {'name' => 'alice', 'age' => 7, 'male' => false}
    row1 = table.insert(value)

    value_table2 = {'name' => 'bob', 'age' => 12, 'male' => true}
    table2_row1 = table2.insert(value_table2)

    # Each table should only see its own inserts, not others in the same shard.
    assert_equal [row1], table.to_a
    assert_equal row1, table.fetch(1)
    assert_equal [table2_row1], table2.to_a

    # Insert returns correct values for row
    assert_equal value['name'], row1['name']
    assert_equal value['age'], row1['age']
    assert_equal value['male'], row1['male']

    # Make sure the expected pubsub events were published.
    assert_equal [make_pubsub_event('shard1', 'table', {:action => 'insert', :id => 1}),
                  make_pubsub_event('shard1', 'table2', {:action => 'insert', :id => 1})],
                 @pubsub.publish_history

    value2 = {'foo' => 52}
    row2 = table.insert(value2)
    assert_equal [row1, row2], table.to_a
    assert_equal row2, table.fetch(2)
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'insert', :id => 2}),
                 @pubsub.publish_history[2]

    value2a = {'foo' => 53}
    updated_row2 = table.update(2, value2a)
    assert_equal updated_row2, table.fetch(2)
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'update', :id => 2}),
                 @pubsub.publish_history[3]

    # Update returns correct values for row
    assert_equal value2a['foo'], updated_row2['foo']

    value3 = {'bar' => 3}
    row3 = table.insert(value3)
    assert_equal(row3, table.fetch(3))
    assert_equal([row1, updated_row2, row3], table.to_a)
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'insert', :id => 3}),
                 @pubsub.publish_history[4]

    # Test to_a_from_min_id
    assert_equal([row1, updated_row2, row3], table.to_a_from_min_id(1))
    assert_equal([updated_row2, row3], table.to_a_from_min_id(2))
    assert_equal([row3], table.to_a_from_min_id(3))
    assert_equal([], table.to_a_from_min_id(4))

    # Test delete.
    table.delete(2)
    assert_equal([row1,  row3], table.to_a)
    assert_equal([table2_row1], table2.to_a)

    assert_equal make_pubsub_event('shard1', 'table', {:action => 'delete', :ids => [2]}),
                 @pubsub.publish_history[5]

    table3_row1 = table3.insert(value)

    # Test getting multiple tables
    table_map = RedisTable.get_tables(@redis, 'shard1', {'table' => 1, 'table2' => 1})
    assert_equal(
       {'table' => {'rows' => [row1, row3]},
        'table2' => {'rows' => [table2_row1]}},
       table_map)

    table_map = RedisTable.get_tables(@redis, 'shard1', {'table'  =>  3})
    assert_equal(
        {'table' =>  {'rows' => [row3]}},
        table_map)

    table_map = RedisTable.get_tables(@redis, 'shard1', {'table'  =>  4, 'table2'  =>  1})
    assert_equal(
        {'table' =>  {'rows' => []},
         'table2' =>  {'rows' => [table2_row1]}},
        table_map)

    assert_equal({}, RedisTable.get_tables(@redis, 'shard1', {}))

    # Test reset shard and make sure it doesn't affect tables in other shards.
    RedisTable.reset_shard('shard1', @redis, @pubsub)
    assert_equal([], table.to_a)
    assert_equal([], table2.to_a)
    assert_raises(RedisTable::NotFound) { table.fetch(1) }
    expected_event = make_pubsub_event('shard1', 'all_tables', {:action => 'reset_shard'})
    assert_equal expected_event, @pubsub.publish_history[7]
    assert_equal [table3_row1], table3.to_a
  end

  def test_delete_many
    # We take care to test multiple tables in the same shard
    # since all of those tables are combined in a single Redis key
    # and could be intermingled in the event of a bug.

    table = RedisTable.new(@redis, @pubsub, 'shard1', 'table')
    other_table = RedisTable.new(@redis, @pubsub, 'shard1', 'table2')

    value1 = {'name' => 'alice', 'age' => 7, 'male' => false}
    value2 = {'name' => 'bob', 'age' => 12, 'male' => true}
    value3 = {'name' => 'chuck', 'age' => 14, 'male' => true}
    row1 = table.insert(value1)
    row2 = table.insert(value2)
    row3 = table.insert(value3)
    other_row1 = other_table.insert(value1)

    # Check initial table set-up
    assert_equal [row1, row2, row3], table.to_a
    assert_equal [other_row1], other_table.to_a

    # Delete two rows at once
    table.delete([1, 3])

    # Check that multi-delete worked
    assert_equal [row2], table.to_a
    assert_equal [other_row1], other_table.to_a

    # Check that multi-delete was published
    assert_equal make_pubsub_event('shard1', 'table', {:action => 'delete', :ids => [1, 3]}),
                 @pubsub.publish_history[4]

    # Clean up
    RedisTable.reset_shard('shard1', @redis, @pubsub)
    RedisTable.reset_shard('shard2', @redis, @pubsub)
  end

  def test_expiration
    # Test with a 1-second expire time
    expire_time = 2
    margin_time = 0.2
    table = RedisTable.new(@redis, @pubsub, 'shard1', 'table', expire_time)
    value1 = {'name' => 'alice', 'age' => 7, 'male' => false}
    row1 = table.insert(value1)

    # Check initial table set-up
    assert_equal [row1], table.to_a

    # Jump to just before expiration
    @redis.time_travel expire_time - margin_time
    assert_equal [row1], table.to_a

    # Reset expiration by inserting a new row
    value2 = {'name' => 'bob', 'age' => 12, 'male' => true}
    row2 = table.insert(value2)
    assert_equal [row1, row2], table.to_a

    # Jump to original expiration time - nothing should be deleted
    @redis.time_travel margin_time
    assert_equal [row1, row2], table.to_a

    # Jump to just before expiration again
    @redis.time_travel expire_time - (2 * margin_time)
    assert_equal [row1, row2], table.to_a

    # Reset expiration by updating a row
    value3 = {'name' => 'bob', 'age' => 12, 'male' => true}
    updated_row2 = table.update(2, value3)
    assert_equal [row1, updated_row2], table.to_a

    # Jump to next expiration time - nothing should be deleted
    @redis.time_travel margin_time
    assert_equal [row1, updated_row2], table.to_a

    # Jump to just before expiration a third time
    @redis.time_travel expire_time - (2 * margin_time)
    assert_equal [row1, updated_row2], table.to_a

    # Reset expiration by deleting a row
    table.delete([1])
    assert_equal [updated_row2], table.to_a

    # Jump to expiration time - nothing should be deleted
    @redis.time_travel margin_time
    assert_equal [updated_row2], table.to_a

    # Jump to just before expiration a final time
    @redis.time_travel expire_time - (2 * margin_time)
    assert_equal [updated_row2], table.to_a

    # Jump to expiration time - this time, everything should be gone
    @redis.time_travel margin_time
    assert_equal [], table.to_a
  end

  def test_uuids
    table = RedisTable.new(@redis, @pubsub, 'shard1', 'table')

    # An inserted row is assigned both an ID and a UUID
    value = {'name' => 'alice', 'age' => 7, 'male' => false}
    row1 = table.insert(value)
    assert_equal 1, row1['id']
    # UUID changes across tests so we do a pattern check
    refute_nil /[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}/ =~ row1['uuid']

    # Updating a row preserves its ID and UUID
    row1_a = table.update(row1['id'], {'name' => 'alex', 'age' => 8, 'male' => true})
    assert_equal row1['id'], row1_a['id']
    assert_equal row1['uuid'], row1_a['uuid']

    # Trying to update the UUID is ignored, the original one is preserved
    row1_b = table.update(row1['id'], {'name' => 'april', 'age' => 9, 'male' => false, 'uuid' => 'fake-uuid'})
    assert_equal row1['id'], row1_b['id']
    assert_equal row1['uuid'], row1_b['uuid']

    # A shard reset lets you generate a row with the same ID but a different UUID.
    RedisTable.reset_shard('shard1', @redis, @pubsub)
    value = {'name' => 'beth', 'age' => 10, 'male' => false}
    row1_c = table.insert(value)
    assert_equal row1['id'], row1_c['id']
    refute_equal row1['uuid'], row1_c['uuid']
  end

  private

  def make_pubsub_event(channel, event, data)
    { :channel => channel, :event => event, :data => data }
  end

end
