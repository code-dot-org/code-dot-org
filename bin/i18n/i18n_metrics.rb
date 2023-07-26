require 'cdo/aws/metrics'
require 'aws-sdk-ec2'
require 'net/http'
require 'socket'

module I18n
  module Metrics
    I18N_METRICS_NAMESPACE = 'I18n'.freeze

    def self.report_runtime(addtl_dimensions)
      log_metric(:Runtime, addtl_dimensions, yield)
    end

    def self.machine_id
      @machine_id ||= begin
        Net::HTTP.get(URI.parse(CDO.ec2_metadata_endpoint + 'instance-id'))
      rescue
        'local_machine'
      end
    end

    def self.log_metric(metric_name, addtl_dimensions, value)
      # add machine_id and environment dimensions to addtl_dimensions
      addtl_dimensions << {name: "Environment", value: CDO.rack_env}
      addtl_dimensions << {name: "MachineId", value: machine_id}

      Cdo::Metrics.put_metric(
        I18N_METRICS_NAMESPACE,
          {
            metric_name: metric_name,
            dimensions: addtl_dimensions,
            value: value
          }
      )
    end
  end
end
