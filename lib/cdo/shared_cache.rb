require 'active_support'
require 'active_support/cache'
require 'active_support/core_ext/object/blank'
require 'active_support/core_ext/integer/time'
require 'honeybadger/ruby'
require 'dalli/elasticache'
require 'observability/errors'

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
          rescue => exception # Notify if Auto Discovery fails.
            Observability::Errors.report(exception)
          end
        end
        return nil unless memcached_hosts.present?

        ActiveSupport::Cache::MemCacheStore.new memcached_hosts, {
          expires_in: 1.month, # prevent permanent entries, but let them stick around for a while
          value_max_bytes: 64.megabytes # max size of single value
        }
      end
    end

    # Generic shared cache.
    # Use memcached if available, with FileStore as fallback.
    def self.cache
      check_cache_version_mismatch
      @@cache ||= (memcached || ActiveSupport::Cache::FileStore.new(cache_dir))
    end

    def self.cache_dir
      # In parallel tests, use a unique cache directory per test process
      if ENV['TEST_ENV_NUMBER']
        dashboard_dir('tmp', 'cache', 'shared', ENV['TEST_ENV_NUMBER'])
      else
        dashboard_dir('tmp', 'cache', 'shared')
      end
    end

    private_class_method def self.check_cache_version_mismatch
      # If we try to create an ActiveSupport::Cache::Store of some kind before
      # the Rails application has been initialized (ie, if we invoke DCDO.get
      # on import), it will get created without any of the configuration values
      # we expect to be applied to it. This is bad in general, but in
      # particular can cause us to default to a deprecated format_version. Pick
      # that value as a canary, and warn if we detect an inconsistency.
      if defined?(@@original_cache_format_version) && @@original_cache_format_version != ActiveSupport::Cache.format_version
        ActiveSupport::Deprecation.new.warn <<~WARNING
          `config.active_support.cache_format_version` changed since initialization, from #{@@original_cache_format_version} to #{ActiveSupport::Cache.format_version}"

          This probably means that CDO.shared_cache was originally initialized in an environment without a Rails application and is now being invoked with one, which we do not support. You probably want to lazily initialize the shared cache.
        WARNING
      end

      @@original_cache_format_version ||= ActiveSupport::Cache.format_version
    end
  end
end
