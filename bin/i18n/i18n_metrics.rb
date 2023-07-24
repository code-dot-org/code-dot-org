require 'cdo/aws/metrics'
require 'aws-sdk-ec2'
require 'net/http'
require 'socket'

module I18n
  module Metrics
    class << self
      attr_accessor :machine_id
    end

    I18N_METRICS_NAMESPACE = 'I18n'.freeze

    def self.report_runtime(addtl_dimensions, value)
      log_metric(:Runtime, addtl_dimensions, value)
    end

    def self.get_machine_id
      begin
        return Net::HTTP.get(URI.parse(CDO.ec2_metadata_endpoint + 'instance-id'))
      rescue
        return "local_machine"
      end
    end

    def self.log_metric(metric_name, addtl_dimensions, value)
      machine_id = I18n::Metrics.machine_id ||= get_machine_id

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
