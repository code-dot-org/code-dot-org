# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Force UTF-8 Encodings.
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Initialize the Rails application.
Dashboard::Application.initialize!

Dashboard::Application.configure do

  MAX_CACHED_BYTES = 256.megabytes
  if CDO.memcached_hosts.present?
    config.cache_store = :mem_cache_store, CDO.memcached_hosts, {
      value_max_bytes: MAX_CACHED_BYTES
    }
  else
    config.cache_store = :memory_store, { size: MAX_CACHED_BYTES }
  end

end
