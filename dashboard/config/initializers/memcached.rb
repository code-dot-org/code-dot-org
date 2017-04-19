# TODO: enable memcached cluster in next deploy,
#   to separate infrastructure change from application change.
# if CDO.memcached_endpoint
#   CDO.memcached_hosts = Dalli::ElastiCache.new(CDO.memcached_endpoint).servers
# end

if CDO.memcached_hosts.present?
  Rails::Application.config.cache_store =
    :mem_cache_store,
      CDO.memcached_hosts,
      {value_max_bytes: 64.megabytes}
end
