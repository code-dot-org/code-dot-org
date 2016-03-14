require 'active_support/notifications'
require_relative '../../dynamic_config/dcdo'
require 'rack/attack'
require 'rack/attack/path_normalizer'
require 'active_support/core_ext/numeric/time'

# An object that dynamically updates the RackAttack configuration based on DCDO and CDO.
# Callers should construct and instance and then call start.
class RackAttackConfigUpdater

  def initialize
  end

  # Begin dynamically updating the RackAttack configuration and return self.
  # RackAttack will be configured to use the given cache store, or, if none is provided, a
  # default store backed by Redis.
  def start(cache_store = nil)
    Rack::Attack.cache.store = cache_store || default_redis_cache_store
    DCDO.add_change_listener(self)
    update_config
    self
  end

  # DCDO change handler to update the RackAttack configuration ,
  def on_change
    update_config
  end

  # Returns the allowed limits by time interval given a base max rate.
  # Allow 4x the max rate over 15s, 2x the max rate over 60s, and 1x the max rate over 4min.
  # This gives the experience of exponential backoff when limits are exceeded.
  def limits(max_per_sec)
    [[1 * max_per_sec * 60, 15],
     [2 * max_per_sec * 60, 60],
     [4 * max_per_sec * 60, 240]]
  end

  private

  # Returns a default rack attack store backed by Redis.
  def default_redis_cache_store
    Rack::Attack::StoreProxy::RedisStoreProxy.new(
        Redis.new(url: CDO.geocoder_redis_url || 'redis://localhost:6379'))
  end

  # Updates the RackAttack limits based on CDO defaults and DCDO overrides.
  def update_config
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

    Rack::Attack.set_blacklist_set(blacklist_set)
  end

  # parse the comma-separated list of channel ids, and return them as a set
  # which we can use to quickly check whether a given channel id is present.
  def blacklist_set
    blacklist = table_and_property_blacklist
    channels = blacklist.split(',') if blacklist
    Set.new(channels)
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

  def table_and_property_blacklist
    get_dcdo_key_with_cdo_default('table_and_property_blacklist')
  end
end

# Override the path normalize and request.write? methods in Rack::Attack.
class Rack::Attack
  # Rack::Attack returns a 429 for requests that exceed the rate limit.

  # Don't strip trailing slashes.
  remove_const(:PathNormalizer)
  PathNormalizer = FallbackPathNormalizer

  class Request < ::Rack::Request
    def write?
      put? || patch? || post? || delete?
    end
  end

  @@channel_id_blacklist_set = {}

  def self.set_blacklist_set(blacklist_set)
    @@channel_id_blacklist_set = blacklist_set
  end

  blacklist('table_and_property_blacklist') do |req|
    channel_id = %r{^/v3/shared-(tables|properties)/([^/]+)}.match(req.path).try(:[], 2)
    @@channel_id_blacklist_set.include?(channel_id)
  end

  ActiveSupport::Notifications.subscribe('rack.attack') do |_, _, _, _, req|
    if CDO.newrelic_logging
      throttle_name = req.env['rack.attack.matched']
      throttle_data = req.env['rack.attack.throttle_data'][throttle_name]
      event_details = {
          throttle_name: throttle_name,
          throttle_data_count: throttle_data[:count],
          throttle_data_period: throttle_data[:period],
          throttle_data_limit: throttle_data[:limit],
          encrypted_channel_id: req.env['rack.attack.match_discriminator'],
      }

      NewRelic::Agent.record_custom_event("RackAttackRequestThrottled", event_details)
      # throttle names are of the form "shared-(tables|properties)/(reads|writes)/#{period}"
      # as defined by the first parameters to the 'throttle' calls above. '/' is a special
      # character in Custom Metric names so we have to rework the name a bit here.
      parts = throttle_name.split('/')
      throttle_type = parts.length == 3 ? "#{parts[0]}_#{parts[1]}" : 'unknown'
      # Always specify a value of 1 so that each metric can be treated as a simple counter.
      NewRelic::Agent.record_metric("Custom/RackAttackRequestThrottled/#{throttle_type}", 1)
    end
  end
end
