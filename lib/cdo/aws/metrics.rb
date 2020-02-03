require 'aws-sdk-cloudwatch'
require 'active_support/core_ext/module/attribute_accessors'
require 'concurrent/async'
require 'honeybadger/ruby'

module Cdo
  # Singleton interface for asynchronously sending a collection of CloudWatch metrics in batches.
  class Metrics
    include Singleton
    include Concurrent::Async

    cattr_accessor :client

    # Ref: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    ITEMS_PER_REQUEST = 20

    # Ref: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html
    BYTES_PER_REQUEST = 1024 * 40

    # Convenience method to put a single metric to CloudWatch.
    # Accepts a single '[namespace]/[metric_name]' name parameter
    # and a standard Ruby hash.
    def put(name, value, dimensions={})
      namespace, metric_name = name.split('/', 2)
      push(namespace,
        [{
          metric_name: metric_name,
          dimensions: dimensions.map {|k, v| {name: k, value: v}},
          value: value
        }]
      )
    end

    # Asynchronously send a collection of CloudWatch metrics in batches.
    # @param namespace [String]
    # @param metrics [Array<Types::MetricDatum>]
    def self.push(namespace, metrics)
      instance.async.push(namespace, metrics)
    end

    def push(namespace, metrics)
      self.client ||= ::Aws::CloudWatch::Client.new(
        retry_limit: 3,
        http_open_timeout: 5,
        http_read_timeout: 5,
        http_idle_timeout: 2
      )
      batches = []
      current_batch = []
      batch_size = 0
      metrics.each do |metric|
        size = JSON.generate(metric).bytesize
        if current_batch.length >= ITEMS_PER_REQUEST || batch_size + size > BYTES_PER_REQUEST
          batches << current_batch
          current_batch = []
          batch_size = 0
        end
        current_batch << metric
        batch_size += size
      end
      batches << current_batch
      batches.each do |batch|
        client.put_metric_data(
          namespace: namespace,
          metric_data: batch
        )
      end
    rescue => e
      Honeybadger.notify(e)
    end
  end
end
