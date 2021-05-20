require 'aws-sdk-cloudwatch'
require 'honeybadger/ruby'
require 'cdo/buffer'

module Cdo
  # Singleton interface for asynchronously sending a collection of CloudWatch metrics in batches.
  module Metrics
    class << self
      # @return [Aws::CloudWatch::Client]
      attr_accessor :client
    end

    BUFFERS = Hash.new {|h, key| h[key] = Buffer.new(key)}

    # '20/PutMetricData request.'
    # Ref: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    ITEMS_PER_REQUEST = 20

    # '40 KB for HTTP POST requests.'
    # Ref: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    BYTES_PER_REQUEST = 1024 * 40

    # 'PutMetricData can handle 150 transactions per second (TPS)'
    # Ref: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    TRANSACTIONS_PER_SECOND = 150.0

    class Buffer < Cdo::Buffer
      def initialize(namespace)
        super(
          batch_count: ITEMS_PER_REQUEST,
          batch_size: BYTES_PER_REQUEST,
          max_interval: 60.0,
          min_interval: 1.0 / (TRANSACTIONS_PER_SECOND / Concurrent.processor_count),
          wait_at_exit: 10.0
        )
        @namespace = namespace
      end

      def flush(events)
        client = Cdo::Metrics.client ||= ::Aws::CloudWatch::Client.new(
          retry_limit: 3,
          http_open_timeout: 5,
          http_read_timeout: 5,
          http_idle_timeout: 2
        )
        client.put_metric_data(
          namespace: @namespace,
          metric_data: events
        )
      rescue => e
        Honeybadger.notify(e)
      end

      def size(events)
        events.sum {|metric| metric.to_json.bytesize}
      end
    end

    # Convenience method to put a single metric to CloudWatch.
    # Accepts a single '[namespace]/[metric_name]' name parameter
    # and a standard Ruby hash to specify dimension key/values.
    #
    # @param [String] name in the form of 'namespace'/'metric_name'
    # @param [Number] value
    # @param [Hash{Symbol => String}] dimensions
    # @param [Hash] options Additional keyword arguments to be merged
    #  into the {Aws::CloudWatch::Types::MetricDatum} object.
    def self.put(name, value, dimensions, **options)
      namespace, metric_name = name.split('/', 2)
      metric = {
        metric_name: metric_name,
        dimensions: dimensions.map {|k, v| {name: k, value: v}},
        value: value,
        timestamp: Time.now
      }.merge(options)
      put_metric(namespace, metric)
    end

    # @param [String] namespace
    # @param [Hash, Aws::CloudWatch::Types::MetricDatum] metric
    def self.put_metric(namespace, metric)
      BUFFERS[namespace].buffer(metric)
    end

    # Asynchronously send a collection of CloudWatch metrics in batches.
    # @param namespace [String]
    # @param metrics [Array<Hash, Aws::CloudWatch::Types::MetricDatum>]
    def self.push(namespace, metrics)
      metrics.each do |metric|
        put_metric(namespace, metric)
      end
    end

    def self.flush!
      BUFFERS.values.each(&:flush!)
    end
  end
end
