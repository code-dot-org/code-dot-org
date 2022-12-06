require 'redis-slave-read'
require 'jumphash'
require 'xxhash'

# Helper for getting a correctly configured Redis client for a particular
# shard key.  Can be configured for any number of shards, where each shard
# can be a single Redis node or a replication group where reads will be
# distributed to read-replicas.
class ShardedRedisFactory
  # @param [Hash<'master':String, 'read_replicas':String[]>[]] config
  # The set of Redis node URLs to be used in the current environment, provided
  # in the following format:
  # [
  #   {
  #     'master': 'redis://master1',
  #     'read_replicas': [
  #       'redis://master1replica1',
  #       'redis://master1replica2'
  #     ]
  #   },
  #   {
  #     'master': 'redis://master2',
  #     'read_replicas': [
  #       'redis://master2replica1',
  #       'redis://master2replica2'
  #     ]
  #   }
  # ]
  #
  # The read_replicas key is optional and you can specify any number of groups.
  #
  # @param [Proc] new_redis_proc (optional) is provided as a hook to allow
  # us to construct fake Redis instances in test.
  def initialize(shards, new_redis_proc = proc {|url| Redis.new(url: url)})
    raise ArgumentError.new('Must provide at least one shard') if shards.empty?
    @new_redis_proc = new_redis_proc
    @shards = shards
  end

  # The set of Redis node URLs to be used for the given shard key.
  #
  # @param [String] shard_key
  # @return [Hash<'master':String, 'read_replicas':String[]>]
  def client_for_key(shard_key)
    index = JumpHash.hash_key(XXhash.xxh64(shard_key), @shards.size)
    shard_config = @shards[index]
    client_for_shard_config shard_config
  end

  # Construct a Redis client for the given redis shard configuration.
  #
  # @param [Hash<'master':String, 'read_replicas':String[]>] shard_config
  # @return [Redis]
  def client_for_shard_config(shard_config)
    master_url = shard_config['master']
    replica_urls = shard_config['read_replicas'] || []

    Redis::SlaveRead::Interface::Hiredis.new(
      {
        read_master: false,
        master: @new_redis_proc[master_url],
        slaves: replica_urls.map {|url| @new_redis_proc[url]}
      }
    )
  end
end
