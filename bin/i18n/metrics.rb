require 'cdo/aws/metrics'
require 'aws-sdk-ec2'
require 'net/http'
require 'socket'

module I18n
  module Metrics
    I18N_METRICS_NAMESPACE = 'I18n'.freeze

    def self.report_runtime(addtl_dimensions = [])
      log_metric(:Runtime, yield, addtl_dimensions)
    end

    def self.report_success(sync_comp)
      log_metric(:Success, 1, [])
    end

    def self.report_failure(sync_comp)
      log_metric(:Failure, 0, [])
    end

    def self.report_filesize(sync_comp)
      log_metric(:Filesize, 0, [])
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

    def self.log_metric(metric_name, value, addtl_dimensions = [])
      # add machine_id and environment dimensions to addtl_dimensions
      addtl_dimensions << {name: 'Environment', value: CDO.rack_env}
      addtl_dimensions << {name: 'MachineId', value: machine_id}

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
