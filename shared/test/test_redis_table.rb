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

    # We take care to test multiple tables in the same shard
    # since all of those tables are combined in a single Redis key
    # and could be intermingled in the event of a bug.

    table = RedisTable.new(redis, 'shard1', 'table')
    # Create another table in the same shard.
    table2 = RedisTable.new(redis, 'shard1', 'table2')
    # Create a third table in a different shard.
    table3 = RedisTable.new(redis, 'shard2', 'table2')

    assert_equal [], table.to_a
    assert_raises(RedisTable::NotFound) { table.fetch(1) }

    value = {'name' => 'alice', 'age' => 7, 'male' => false}
    inserted = table.insert(value)

    value_table2 = {'name' => 'bob', 'age' => 12, 'male' => true}
    table2.insert(value_table2)

    # Each table should only see its own inserts, not others in the same shard.
    assert_equal row(value, 1), inserted
    assert_equal [row(value, 1)], table.to_a
    assert_equal row(value, 1), table.fetch(1)
    assert_equal [row(value_table2, 1)], table2.to_a

    value2 = {'foo' => 52}
    table.insert(value2)
    assert_equal [row(value, 1), row(value2, 2)], table.to_a
    assert_equal row(value2, 2), table.fetch(2)

    value2a = {'foo' => 53}
    updated = table.update(2, value2a)
    assert_equal(row(value2a, 2), updated)

    value3 = {'bar' => 3}
    table.insert(value3)
    assert_equal(row(value3, 3), table.fetch(3))
    assert_equal([row(value, 1), row(value2a, 2), row(value3, 3)], table.to_a)

    # Test to_a_from_min_id
    assert_equal([row(value, 1), row(value2a, 2), row(value3, 3)], table.to_a_from_min_id(1))
    assert_equal([row(value2a, 2), row(value3, 3)], table.to_a_from_min_id(2))
    assert_equal([row(value3, 3)], table.to_a_from_min_id(3))
    assert_equal([], table.to_a_from_min_id(4))

    # Test delete.
    table.delete(2)
    assert_equal([row(value, 1),  row(value3, 3)], table.to_a)
    assert_equal([row(value_table2, 1)], table2.to_a)

    table3.insert(value)

    # Test getting multiple tables
    table_map = RedisTable.get_tables(redis, 'shard1', {'table' => 1, 'table2' => 1})
    assert_equal(
       {'table' =>
            {'rows' => [{'name' => 'alice', 'age' => 7, 'male'=>false, 'id' => 1}, {'bar' => 3, 'id' => 3}]},
        'table2' =>
            {'rows' => [{'name' => 'bob', 'age' => 12, 'male' => true, 'id' => 1}]}},
       table_map)

    table_map = RedisTable.get_tables(redis, 'shard1', {'table'  =>  3})
    assert_equal(
        {'table' =>  {'rows' => [{'bar' => 3, 'id' => 3}]}},
        table_map)

    table_map = RedisTable.get_tables(redis, 'shard1', {'table'  =>  4, 'table2'  =>  1})
    assert_equal(
        {'table' =>  {'rows' => []},
         'table2' =>  {'rows' => [{'name' => 'bob', 'age' => 12, 'male' => true, 'id' => 1}]}},
        table_map)

    assert_equal({}, RedisTable.get_tables(redis, 'shard1', {}))

    # Test reset shard and make sure it doesn't affect tables in other shards.
    RedisTable.reset_shard('shard1', redis)
    assert_equal([], table.to_a)
    assert_equal([], table2.to_a)
    assert_raises(RedisTable::NotFound) { table.fetch(1) }
    assert_equal [row(value, 1)], table3.to_a
  end

  private

  def row(row, id)
    row.merge({'id' => id})
  end

  def make_pubsub_event(channel, event, data)
    { :channel => channel, :event => event, :data => data }
  end

end
