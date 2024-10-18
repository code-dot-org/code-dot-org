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

    BUFFERS = Hash.new {|h, key| h[key] = Buffer.new(key)}

    # Ref: http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
    MAXIUMUM_BATCH_SIZE = 1024 * 1024
    MAXIMUM_BATCH_COUNT = 10000
    MAXIMUM_EVENT_SIZE = 256 * 1024
    # Service Quota: https://us-east-1.console.aws.amazon.com/servicequotas/home/services/logs/quotas/L-7E1FAE88
    MAX_TRANSACTIONS_PER_SECOND = 5000

    class Buffer < Cdo::Buffer
      def initialize(log_group_name, log_stream_name)
        super(
          batch_count: MAXIMUM_BATCH_COUNT,
          batch_size: MAXIUMUM_BATCH_SIZE,
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
        # client.put_log_events(
        #   log_group_name: @log_group_name,
        #   log_stream_name: @log_stream_name,
        #   log_events: events
        # )
      rescue => exception
        Honeybadger.notify(exception)
      end

      def size(events)
        # Sum all event messages, plus 26 bytes per event for the timestamp and other metadata
        events.sum {|event| event[:message].bytesize + 26}
      end
    end

    def self.put_log_events(log_group_name, log_stream_name, events)
      raise "Event message is too large" if events.any? {|event| event[:message].bytesize > MAXIMUM_EVENT_SIZE}
      BUFFERS["#{log_group_name}/#{log_stream_name}"].push(events)
    end
  end
end
