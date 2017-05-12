require 'active_support/cache'

# Provide a long-lived, cross-instance shared cache.
# Use for caching objects that should be shared across multiple
# frontend instances, or that should persist across server restarts.
#
# Use memcached if available, with a file-based store as fallback.
#
# Note that this isn't a guaranteed-persistent key-value store,
# cached objects may be evicted at any time.
module Cdo
  class SharedCache
    def self.cache
      # Use dalli-elasticache for AWS ElastiCache Auto Discovery of Memcached nodes.
      if CDO.memcached_endpoint
        CDO.memcached_hosts = Dalli::ElastiCache.new(CDO.memcached_endpoint).servers
      end

      if CDO.memcached_hosts.present?
        ActiveSupport::Cache::MemCacheStore.new CDO.memcached_hosts, {
          value_max_bytes: 64.megabytes # max size of single value
        }
      else
        ActiveSupport::Cache::FileStore.new(dashboard_dir('tmp', 'cache'))
      end
    end
  end
end

CDO.shared_cache = Cdo::SharedCache.cache
