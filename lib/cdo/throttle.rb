require 'cdo/shared_cache'
require 'dynamic_config/dcdo'

module Cdo
  module Throttle
    CACHE_PREFIX = "cdo_throttle/".freeze
    MINIMUM_EXPIRATION = 1.day

    # @param [String] id Unique identifier to throttle on.
    # @param [Integer] limit Count of metric allowed over period.
    #   The limit by default is a number of requests, but it can be any metric if the count parameter is provided.
    # @param [Integer] period Period of time in seconds.
    # @param [Integer] throttle_for How long id should stay throttled in seconds. Optional.
    #   Defaults to Cdo::Throttle.throttle_time.
    # @param [Integer] count Metric count to add for a given request. Optional.
    #   Defaults to 1, and only needs to be set if the metric you're throttling on is not 1:1 with request count.
    # @returns [Boolean] Whether the request should be throttled.
    def self.throttle(id, limit, period, throttle_for: throttle_time, count: 1)
      value = get_value(id)
      now = Time.now.utc

      value[:request_entries] << {timestamp: now, count: count}

      if value[:throttled_until]&.future?
        should_throttle = true
      else
        value[:throttled_until] = nil
        earliest = now - period

        value[:request_entries].select! {|entry| entry[:timestamp] >= earliest}
        total_count = value[:request_entries].sum {|entry| entry[:count]}

        should_throttle = total_count > limit
        value[:throttled_until] = now + throttle_for if should_throttle
      end

      expires_in = expiration_time(period, throttle_for)
      full_key = cache_key(id)
      CDO.shared_cache.write(full_key, value, expires_in: expires_in)
      should_throttle
    end

    def self.throttled?(id)
      value = get_value(id)
      !!value[:throttled_until]&.future?
    end

    def self.get_value(id)
      full_key = cache_key(id)
      raw_value = CDO.shared_cache.read(full_key)

      raw_value.nil? ?
        empty_value :
        normalize_value(raw_value)
    end

    def self.empty_value
      {
        throttled_until: nil,
        request_entries: []
      }
    end

    # Normalize old data format where we only stored request timestamps
    # to the new format where we store request entries with timestamps and counts.
    #
    # NOTE: this should be removable a day after the new format is deployed,
    # as current usages of this module have very short throttle periods and entries expire after a day,
    # per the expiration_time below.
    def self.normalize_value(raw_value)
      if raw_value.key?(:request_entries)
        raw_value
      elsif raw_value.key?(:request_timestamps)
        {
          throttled_until: raw_value[:throttled_until],
          request_entries: raw_value[:request_timestamps].map {|timestamp| {timestamp: timestamp, count: 1}}
        }
      else
        raise 'Invalid throttle data format'
      end
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

      # Expiring entries too quickly can result in increased CPU usage on the
      # cluster if we end up repeatedly expiring and recreating them. To avoid
      # that, set a generous minimum expiration which should avoid thrashing
      # while also preventing unbounded growth.
      return [max_data_relevancy, MINIMUM_EXPIRATION].max
    end
  end
end
