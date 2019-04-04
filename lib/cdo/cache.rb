require 'active_support'
require 'active_support/cache'

# In-memory cache store.
# Simplest, fastest, most reliable option for caching objects within a process,
# without any network or disk I/O.
#
# Use for caching objects small enough to easily fit in memory, that don't need
# to be shared across multiple processes or servers.
#
# Objects in this cache will persist across multiple requests,
# but will be cleared on application restart.
CDO.cache = ActiveSupport::Cache::MemoryStore.new(cache_size: 128.megabytes)
