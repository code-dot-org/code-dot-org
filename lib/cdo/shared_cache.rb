require 'active_support/cache'
require 'active_support/core_ext/object/blank'
require 'honeybadger/ruby'
require 'dalli/elasticache'

# Provide a long-lived, cross-instance shared cache.
# Use for caching objects that should be shared across multiple
# frontend instances, or that should persist across server restarts.
#
# Note that this isn't a guaranteed-persistent key-value store,
# cached objects may be evicted at any time.
module Cdo
  class SharedCache
    # Returns a MemCacheStore if memcached is configured, otherwise nil.
    def self.memcached
      @@memcached ||= begin
        memcached_hosts = CDO.memcached_hosts
        # Use dalli-elasticache for AWS ElastiCache Auto Discovery of Memcached nodes.
        if CDO.memcached_endpoint
          begin
            memcached_hosts = Dalli::ElastiCache.new(CDO.memcached_endpoint).servers
          rescue => e # Notify if Auto Discovery fails.
            Honeybadger.notify(e)
          end
        end
        return nil unless memcached_hosts.present?

        ActiveSupport::Cache::MemCacheStore.new memcached_hosts, {
          value_max_bytes: 64.megabytes # max size of single value
        }
      end
    end

    # Generic shared cache.
    # Use memcached if available, with FileStore as fallback.
    def self.cache
      @@cache ||= begin
        memcached || ActiveSupport::Cache::FileStore.new(dashboard_dir('tmp', 'cache', 'shared'))
      end
    end
  end
end

CDO_SHARED_CACHE = Cdo::SharedCache.cache
