require 'aws-sdk-cloudwatch'
require 'active_support/core_ext/module/attribute_accessors'
require 'concurrent/async'
require 'honeybadger/ruby'
require 'cdo/buffer'

module Cdo
  # Singleton interface for asynchronously sending a collection of CloudWatch metrics in batches.
  class Metrics
    include Singleton
    cattr_accessor :client

    def initialize
      @buffer = Hash.new {|h, key| h[key] = Buffer.new(key)}
    end

    # Ref: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    ITEMS_PER_REQUEST = 20

    # Ref: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    BYTES_PER_REQUEST = 1024 * 40

    class Buffer < Cdo::Buffer
      def initialize(namespace)
        super(
          batch_events: ITEMS_PER_REQUEST,
          batch_size: BYTES_PER_REQUEST,
          batch_interval: 60,
          min_interval: 0.1
        )
        @namespace = namespace
      end

      def flush(events)
        client = Metrics.client ||= ::Aws::CloudWatch::Client.new(
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
    end

    # Convenience method to put a single metric to CloudWatch.
    # Accepts a single '[namespace]/[metric_name]' name parameter
    # and a standard Ruby hash.
    def put(name, value, dimensions={}, **options)
      namespace, metric_name = name.split('/', 2)
      metric = {
        metric_name: metric_name,
        dimensions: dimensions.map {|k, v| {name: k, value: v}},
        value: value,
        timestamp: Time.now
      }.merge(options)
      put_metric(namespace, metric)
    end

    def self.put(name, value, dimensions={}, **options)
      instance.put(name, value, dimensions, **options)
    end

    def put_metric(namespace, metric)
      @buffer[namespace].buffer(metric, metric.to_json.bytesize)
    end

    def self.put_metric(namespace, metric)
      instance.put_metric(namespace, metric)
    end

    # Asynchronously send a collection of CloudWatch metrics in batches.
    # @param namespace [String]
    # @param metrics [Array<Types::MetricDatum>]
    def self.push(namespace, metrics)
      metrics.each do |metric|
        put_metric(namespace, metric)
      end
    end
  end
end
