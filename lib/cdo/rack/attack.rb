require 'rack/attack'
require 'active_support/core_ext/numeric/time'

redis_url = CDO.geocoder_redis_url || 'redis://localhost:6379'
Rack::Attack.cache.store = Rack::Attack::StoreProxy::RedisStoreProxy.new(Redis.new(url: redis_url))

Rack::Attack.throttle('shared_tables_reads', :limit => 2, :period => 5.seconds) do |req|
  # extract the channel id for get requests to shared tables
  req.get? && %r{^/v3/shared-tables/([^/]+)}.match(req.path).try(:[], 0)
end
