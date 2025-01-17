require 'cdo/shared_cache'
require 'dynamic_config/dcdo'

module Cdo
  module Throttle
    CACHE_PREFIX = "cdo_throttle/".freeze
    MINIMUM_EXPIRATION = 1.day

    # @param [String] id - Unique identifier to throttle on.
    # @param [Integer] limit - Number of requests allowed over period.
    # @param [Integer] period - Period of time in seconds.
    # @param [Integer] throttle_for - How long id should stay throttled in seconds. Optional.
    # Defaults to Cdo::Throttle.throttle_time.
    # @returns [Boolean] Whether or not the request should be throttled.
    def self.throttle(id, limit, period, throttle_for = throttle_time)
      full_key = cache_key(id)
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

      expires_in = expiration_time(period, throttle_for)
      CDO.shared_cache.write(full_key, value, expires_in: expires_in)
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

    def self.cache_key(id)
      return CACHE_PREFIX + id.to_s
    end

    def self.expiration_time(period, throttle_for)
      # The maximum time (in seconds) for which any information contained in
      # this entry could possibly be relevant.
      max_data_relevancy = period + throttle_for

      # We saw singificantly increased CPU usage on the cluster after
      # implementing expiration, and theorize that it may be because we were
      # expiring entries TOO quickly. Speculatively add a minimum expiration to
      # see if it smoothes things out.
      # TODO infra: verify this fix and update either comment or code as necessary
      return [max_data_relevancy, MINIMUM_EXPIRATION].max
    end
  end
end
