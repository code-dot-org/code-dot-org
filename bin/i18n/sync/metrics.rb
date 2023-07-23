require 'benchmark'
require 'cdo/aws/metrics'
require 'aws-sdk-ec2'
require 'net/http'
require 'socket'

module I18n
  module Sync
    module Metrics
      I18N_METRICS_NAMESPACE = 'I18n'.freeze

      def self.runtime(process)
        result = nil
        runtime = Benchmark.realtime {result = yield}
        log_metric(
          :RuntimeTest,
          runtime,
          [
            {name: "SyncStep", value: "in"},
            {name: "MethodName", value: process}
          ],
          'Seconds'
        )

        result
      end

      def self.machine_id
        @machine_id ||= begin
          metadata_endpoint = 'http://169.254.169.254/latest/meta-data/'
          Net::HTTP.get(URI.parse(metadata_endpoint + 'instance-id'))
        rescue
          'local_machine'
        end
      end

      # logging metrics into cloudwatch under i18n name space
      # @param metric_name [Symbol] A metric name
      # @param metric_value [Object] A metric value
      # @param addtl_dimensions [Array<Hash>] additional dimensions
      # @option opts [String] Metric units. Valid Values see CloudWatch MetricDatum:
      # https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDatum.html
      def self.log_metric(metric_name, metric_value, addtl_dimensions, metric_units='None')
        # add machine_id and environment dimensions to addtl_dimensions
        addtl_dimensions << {name: "Environment", value: CDO.rack_env}
        addtl_dimensions << {name: "MachineId", value: machine_id}

        Cdo::Metrics.push(
          I18N_METRICS_NAMESPACE,
          [
            {
              metric_name: metric_name,
              dimensions: addtl_dimensions,
              value: metric_value,
              unit: metric_units
            }
          ]
        )
      end
    end
  end
end
