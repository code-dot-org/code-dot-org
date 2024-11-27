require 'aws-sdk-cloudwatchlogs'
require 'honeybadger/ruby'
require 'cdo/buffer'

module Cdo
  # Singleton interface for asynchronously sending log events to CloudWatch in batches
  module CloudWatchLogs
    class << self
      # @return [Aws::CloudWatchLogs::Client]
      attr_accessor :client
    end

    BUFFERS = Hash.new {|h, key| h[key] = Buffer.new(key.split("/").first, key.split("/").last)}

    # Ref: http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
    MAXIMUM_BATCH_SIZE = 1024 * 1024
    MAXIMUM_BATCH_COUNT = 10000
    MAXIMUM_EVENT_SIZE = 256 * 1024
    # Service Quota: https://us-east-1.console.aws.amazon.com/servicequotas/home/services/logs/quotas/L-7E1FAE88
    MAX_TRANSACTIONS_PER_SECOND = 5000 / 25 / 48 # 25 instances with 48 vCPUs each

    class Buffer < Cdo::Buffer
      def initialize(log_group_name, log_stream_name)
        super(
          batch_count: MAXIMUM_BATCH_COUNT,
          batch_size: MAXIMUM_BATCH_SIZE,
          max_interval: 60, # try to flush at least every minute
          min_interval: 1.0 / MAX_TRANSACTIONS_PER_SECOND,
          wait_at_exit: 10.0
        )
        @log_group_name = log_group_name
        @log_stream_name = log_stream_name
      end

      def flush(events)
        client = Cdo::CloudWatchLogs.client ||= ::Aws::CloudWatchLogs::Client.new(
          # Wait less than the defaults (see https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/CloudWatchLogs/Client.html#initialize-instance_method)
          http_open_timeout: 5,
          http_read_timeout: 5,
          http_idle_timeout: 2
        )
        resp = client.put_log_events(
          log_group_name: @log_group_name,
          log_stream_name: @log_stream_name,
          log_events: events
        )
        Honeybadger.notify("Log events rejected #{resp.rejected_log_events_info.to_json}") if resp.rejected_log_events_info
      rescue => exception
        Honeybadger.notify(exception)
        puts "Error sending logs to group/stream #{@log_group_name}/#{@log_stream_name}: #{exception.full_message}" if rack_env?(:development)
      end

      def size(events)
        # Sum all event messages, plus 26 bytes per event for the timestamp and other metadata
        events.sum {|event| event[:message].bytesize + 26}
      end
    end

    # @param [String] log_group_name
    # @param [String] log_stream_name
    # @param [Hash, Aws::CloudWatchLogs::Types::InputLogEvent] log event
    def self.put_log_event(log_group_name, log_stream_name, event)
      raise "Event message is too large" if event[:message].bytesize > MAXIMUM_EVENT_SIZE
      BUFFERS["#{log_group_name}/#{log_stream_name}"].buffer(event)
    end

    # Asynchronously send a collection of CloudWatch logs in batches.
    # @param [String] log_group_name
    # @param [String] log_stream_name
    # @param metrics [Array<Aws::CloudWatch::Types::MetricDatum>]
    def self.put_log_events(log_group_name, log_stream_name, events)
      events.each do |event|
        put_log_event(log_group_name, log_stream_name, event)
      end
    end

    def self.flush!
      BUFFERS.each_value(&:flush!)
    end
  end
end
