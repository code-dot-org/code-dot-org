# Unit tests for ShardedRedisFactory
# This uses a fake in-memory Redis service that does not actually support
# replication.

require_relative '../../test_helper'
require 'fakeredis'
require 'helpers/sharded_redis_factory'

# Monkeypatch Redis client so we can store the URL we used when creating it;
# FakeRedis always lists a localhost URL when connecting to an in-memory store,
# which isn't helpful for checking that we passed the right configuration.
class Redis
  attr_accessor :url_according_to_test
end

# Provide an alternate Redis construction Proc that will use FakeRedis (because
# we imported it above) and store the URL we wanted to pass so we can check it
# in our tests.
TEST_NEW_REDIS_PROC = proc do |url|
  Redis.new(url: url).tap do |fake_redis|
    fake_redis.url_according_to_test = url
  end
end

class ShardedRedisFactoryTest < MiniTest::Test
  include SetupTest

  def test_raises_if_constructed_with_empty_shards
    assert_raises ArgumentError do
      ShardedRedisFactory.new []
    end
  end

  def test_single_node_config
    factory = ShardedRedisFactory.new(
      [{'master' => 'redis://master'}],
      TEST_NEW_REDIS_PROC
    )
    client = factory.client_for_key('any old key')
    assert_equal 'redis://master', client.master.url_according_to_test
  end

  def test_single_replication_group_config
    factory = ShardedRedisFactory.new(
      [
        {
          'master' => 'redis://master',
          'read_replicas' => [
            'redis://replica1',
            'redis://replica2'
          ]
        }
      ],
      TEST_NEW_REDIS_PROC
    )
    client = factory.client_for_key('does not matter')
    assert_equal 'redis://master', client.master.url_according_to_test
    assert_equal 'redis://replica1', client.slaves[0].url_according_to_test
    assert_equal 'redis://replica2', client.slaves[1].url_according_to_test
  end

  def test_three_master_config
    factory = ShardedRedisFactory.new(
      [
        {'master' => 'redis://master1'},
        {'master' => 'redis://master2'},
        {'master' => 'redis://master3'}
      ],
      TEST_NEW_REDIS_PROC
    )

    # Shard selection is deterministic, so we just found appropriate keys
    # for this test without pinning any randomness.
    client = factory.client_for_key('a shard key')
    assert_equal 'redis://master1', client.master.url_according_to_test

    client = factory.client_for_key('alternate shard key')
    assert_equal 'redis://master2', client.master.url_according_to_test

    client = factory.client_for_key('a different shard key')
    assert_equal 'redis://master3', client.master.url_according_to_test
  end

  def test_two_replication_group_config
    factory = ShardedRedisFactory.new(
      [
        {
          'master' => 'redis://master1',
          'read_replicas' => [
            'redis://replica1_1',
            'redis://replica1_2'
          ]
        },
        {
          'master' => 'redis://master2',
          'read_replicas' => [
            'redis://replica2_1',
            'redis://replica2_2'
          ]
        }
      ],
      TEST_NEW_REDIS_PROC
    )

    # Shard selection is deterministic, so we just found appropriate keys
    # for this test without pinning any randomness.
    client = factory.client_for_key('shard 1')
    assert_equal 'redis://master1', client.master.url_according_to_test
    assert_equal 'redis://replica1_1', client.slaves[0].url_according_to_test
    assert_equal 'redis://replica1_2', client.slaves[1].url_according_to_test

    client = factory.client_for_key('shard 2')
    assert_equal 'redis://master2', client.master.url_according_to_test
    assert_equal 'redis://replica2_1', client.slaves[0].url_according_to_test
    assert_equal 'redis://replica2_2', client.slaves[1].url_according_to_test
  end
end
