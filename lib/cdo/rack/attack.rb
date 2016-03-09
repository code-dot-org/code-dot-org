require 'rack/attack'
require 'rack/attack/path_normalizer'
require 'active_support/core_ext/numeric/time'

class Rack::Attack
  # Rack::Attack returns a 429 for requests that exceed the rate limit.

  redis_url = CDO.geocoder_redis_url || 'redis://localhost:6379'
  cache.store = StoreProxy::RedisStoreProxy.new(Redis.new(url: redis_url))

  # Don't strip trailing slashes.
  remove_const(:PathNormalizer)
  PathNormalizer = FallbackPathNormalizer

  class Request < ::Rack::Request
    def write?
      put? || patch? || post? || delete?
    end
  end

end

# A configuration object for setting and dynamically updating the Rack attack limits based
# on DCDO/CDO configuration.
class RackAttackLimitConfiguration
  def start_dynamic_updates
    update_limits
    DCDO.add_change_listener(self)
  end

  def on_change
    update_limits
  end

  private

  def update_limits
    puts "Updating limits"

    limits(max_table_reads_per_sec).each do |limit, period|
      Rack::Attack.throttle("shared-tables/reads/#{period}",
                            :limit => limit, :period => period.seconds) do |req|
        # extract the channel id for get requests to shared tables. Only match full
        # table reads, because createRecord commands get redirected to individual row
        # reads and we don't want those reads to count toward these limits.
        req.get? && %r{^/v3/shared-tables/([^/]+)/[^/]+$}.match(req.path).try(:[], 1)
      end
    end

    limits(max_table_writes_per_sec).each do |limit, period|
      Rack::Attack.throttle("shared-tables/writes/#{period}",
                            :limit => limit, :period => period.seconds) do |req|
        # extract the channel id for create, update and delete requests to shared tables.
        # TODO(dave): Make imports and other table/column operations not fall into this bucket
        # once we are accounting for them separately.
        req.write? && %r{^/v3/shared-tables/([^/]+)}.match(req.path).try(:[], 1)
      end
    end

    limits(max_property_reads_per_sec).each do |limit, period|
      Rack::Attack.throttle("shared-properties/reads/#{period}",
                            :limit => limit, :period => period.seconds) do |req|
        # extract the channel id for reads of shared properties.
        req.get? && %r{^/v3/shared-properties/([^/]+)/[^/]+$}.match(req.path).try(:[], 1)
      end
    end

    limits(max_property_writes_per_sec).each do |limit, period|
      Rack::Attack.throttle("shared-properties/writes/#{period}",
                            :limit => limit, :period => period.seconds) do |req|
        # extract the channel id for writes to shared properties.
        req.write? && %r{^/v3/shared-properties/([^/]+)/[^/]+$}.match(req.path).try(:[], 1)
      end
    end
  end

  # Returns the given key from DCDO, default to the CDO value if no DCDO
  # value is defined.
  def get_dcdo_key_with_cdo_default(key)
    DCDO.get(key, CDO[key])
  end

  def max_table_reads_per_sec
    get_dcdo_key_with_cdo_default('max_table_reads_per_sec')
  end

  def max_table_writes_per_sec
    get_dcdo_key_with_cdo_default('max_table_writes_per_sec')
  end

  def max_property_reads_per_sec
    get_dcdo_key_with_cdo_default('max_property_reads_per_sec')
  end

  def max_property_writes_per_sec
    get_dcdo_key_with_cdo_default('max_property_writes_per_sec')
  end

  def limits(max_per_sec)
    # allow 4x the max rate over 15s, 2x the max rate over 60s, and 1x the max rate over 4min.
    # this gives the experience of exponential backoff when limits are exceeded.
    [[1 * max_per_sec * 60, 15],
     [2 * max_per_sec * 60, 60],
     [4 * max_per_sec * 60, 240]]
  end

end

RackAttackLimitConfiguration.new.start_dynamic_updates
