require 'benchmark'
require 'cdo/aws/metrics'
require 'aws-sdk-ec2'
require 'net/http'
require 'socket'

module I18n
  module Sync
    module Metrics
      I18N_METRICS_NAMESPACE = 'I18n'.freeze
      class << self
        attr_accessor :machine_id
      end

      def self.runtime(process)
        start = Time.now
        elapsed = Benchmark.realtime {yield}
        log_metric(:RuntimeTest,
                   [
                     {name: "SyncStep", value: "in"},
                     {name: "MethodName", value: process}
                     # {name: "StartTime", value: start.utc.strftime("%Y/%m/%d")}
                   ],
                   elapsed,
                   'Seconds'
        )
        puts "#{Time.now.utc.iso8601},#{process},#{start.utc.strftime('%Y/%m/%d')},#{elapsed}"
      end

      def self.get_machine_id
        @get_machine_id ||= begin
          metadata_endpoint = 'http://169.254.169.254/latest/meta-data/'
          Net::HTTP.get(URI.parse(metadata_endpoint + 'instance-id'))
        rescue
          'local_machine'
        end
      end

      def self.log_metric(metric_name, addtl_dimensions, value, units='None')
        machine_id = I18n::Sync::Metrics.machine_id ||= get_machine_id
        # add machine_id and environment dimensions to addtl_dimensions
        addtl_dimensions << {name: "Environment", value: CDO.rack_env}
        addtl_dimensions << {name: "MachineId", value: machine_id}

        Cdo::Metrics.push(
          I18N_METRICS_NAMESPACE,
          [
            {
              metric_name: metric_name,
              dimensions: addtl_dimensions,
              value: value,
              unit: units
            }
          ]
        )
      end
    end
  end
end
