require 'cdo/shared_cache'
require 'dynamic_config/dcdo'

module Cdo
  module Throttle
    CACHE_PREFIX = "cdo_throttle/".freeze

    # @param [String] id - Unique identifier to throttle on.
    # @param [Integer] limit - Number of requests allowed over period.
    # @param [Integer] period - Period of time in seconds.
    # @param [Integer] throttle_for - How long id should stay throttled in seconds. Optional.
    # Defaults to Cdo::Throttle.throttle_time.
    # @returns [Boolean] Whether or not the request should be throttled.
    def self.throttle(id, limit, period, throttle_for = throttle_time)
      full_key = CACHE_PREFIX + id.to_s
      value = CDO.shared_cache.read(full_key) || empty_value
      now = Time.now.utc
      value[:request_timestamps] << now

      if value[:throttled_until]&.future?
        should_throttle = true
      else
        value[:throttled_until] = nil
        earliest = now - period
        value[:request_timestamps].select! {|timestamp| timestamp >= earliest}
        should_throttle = value[:request_timestamps].size > limit
        value[:throttled_until] = now + throttle_for if should_throttle
      end

      CDO.shared_cache.write(full_key, value)
      should_throttle
    end

    def self.empty_value
      {
        throttled_until: nil,
        request_timestamps: []
      }
    end

    def self.throttle_time
      DCDO.get('throttle_time_default', 60)
    end
  end
end
