
# Unit tests for redis-slave-read gem
# Hopefully the gem is well-tested and reliable, but we are changing our
# configuration and wanted to verify that traffic would be distributed as
# expected across nodes within a cluster.

require_relative '../test_helper'
require 'redis-slave-read'
require 'helpers/sharded_redis_factory'

class RedisSlaveReadGemTest < Minitest::Test
  include SetupTest

  def setup
    @shard_id = '_testShard2'
  end

  def test_distribute_reads
    nodes = []
    test_redis_proc = proc do |url|
      # Read operations distribute evenly across all nodes
      node = MiniTest::Mock.new
      unless url == "redis://netsim-1"
        node.expect :hgetall, {}, [String]
      end
      nodes << node
      node
    end

    test_redis = ShardedRedisFactory.new(
      [
        {
          "master" => "redis://netsim-1",
          "read_replicas" => [
            "redis://netsim-1-001",
            "redis://netsim-1-002",
            "redis://netsim-1-003",
          ]
        }
      ],
      test_redis_proc
    ).client_for_key('any key')

    test_redis.hgetall @shard_id
    test_redis.hgetall @shard_id
    test_redis.hgetall @shard_id

    nodes.each(&:verify)
  end

  def test_not_distribute_writes
    nodes = []
    test_redis_proc = proc do |url|
      # Write operations only expected on master
      node = MiniTest::Mock.new
      if url == "redis://netsim-1"
        node.expect :hincrby, 1, [String, String, Integer]
        node.expect :hincrby, 1, [String, String, Integer]
        node.expect :hincrby, 1, [String, String, Integer]
      end
      nodes << node
      node
    end

    test_redis = ShardedRedisFactory.new(
      [
        {
          "master" => "redis://netsim-1",
          "read_replicas" => [
            "redis://netsim-1-001",
            "redis://netsim-1-002",
            "redis://netsim-1-003",
          ]
        }
      ],
      test_redis_proc
    ).client_for_key('any key')

    test_redis.hincrby @shard_id, 'string', 1
    test_redis.hincrby @shard_id, 'string', 1
    test_redis.hincrby @shard_id, 'string', 1
    nodes.each(&:verify)
  end
end
