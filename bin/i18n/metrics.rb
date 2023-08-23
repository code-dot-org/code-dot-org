require 'cdo/aws/metrics'
require 'aws-sdk-ec2'
require 'net/http'
require 'socket'
require 'benchmark'

module I18n
  module Metrics
    I18N_METRICS_NAMESPACE = 'I18n'.freeze

    # logging to CloudWatch the runtime of a yield block, typically a method, in Milliseconds.
    # @param method_name [String] Name of the method logged to CloudWatch
    # @param sync_step [String] Step of the sync where the method is used. Options: in, up, down, out.
    def self.report_runtime(method_name, sync_step)
      result = nil
      runtime = Benchmark.realtime {result = yield}
      log_metric(
        :Runtime,
        runtime.in_milliseconds.to_i,
        [{name: "MethodName", value: method_name}, {name: "SyncStep", value: sync_step}],
        'Milliseconds'
      )

      result
    end

    def self.report_filesize(file_path, sync_step)
      file_name = File.basename(file_path)
      file_dir = File.dirname(file_path)
      log_metric(
        :FileSize,
        File.size(file_path),
        [{name: 'SyncStep', value: sync_step}, {name: 'FileName', value: file_name}, {name: 'FileDir', value: file_dir}],
        'Bytes'
      )
    end

    # returns the EC2 instance ID if we are running the sync from an EC2,
    # and 'local_machine' otherwise
    def self.machine_id
      @machine_id ||= begin
        Net::HTTP.get(URI.parse(CDO.ec2_instance_id_endpoint))
      rescue
        'local_machine'
      end
    end

    # logging metrics into cloudwatch under i18n name space
    # @param metric_name [Symbol] A metric name
    # @param metric_value [Object] A metric value
    # @param addtl_dimensions [Array<Hash>] additional dimensions
    # @option metric_units [String] Units of the value. Ex. Seconds, Kilobytes, etc.
    # For more valid units see CloudWatch MetricDatum:
    # https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDatum.html
    def self.log_metric(metric_name, metric_value, addtl_dimensions = [], metric_units = 'None')
      # add machine_id and environment dimensions to addtl_dimensions
      addtl_dimensions << {name: 'Environment', value: CDO.rack_env}
      addtl_dimensions << {name: 'MachineId', value: machine_id}
      puts "#{I18N_METRICS_NAMESPACE} {metric_name: #{metric_name}, value: #{metric_value}, dimensions: #{addtl_dimensions}, unit: #{metric_units}}"
      Cdo::Metrics.put_metric(
        I18N_METRICS_NAMESPACE,
          {
            metric_name: metric_name,
            value: metric_value,
            dimensions: addtl_dimensions,
            unit: metric_units
          }
      )
    end
  end
end
