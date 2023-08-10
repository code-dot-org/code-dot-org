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

    def self.report_filesize(file_name, sync_step)
      # addtl_dimensions << {name: 'SyncStep', value: sync_step}
      # addtl_dimensions << {name: 'FileName', value: file_name}
      file_path = CDO.dir(File.join("/i18n/locales/source", file_name))
      log_metric(
        :FileSizeTest,
        File.size(file_path),
        [{name: 'SyncStep', value: sync_step}, {name: 'FileName', value: file_name}],
        'Bytes'
      )
      file = File.read(file_path)
      log_metric(:FileLinesTest, file.count($/), [{name: 'SyncStep', value: sync_step}, {name: 'FileName', value: file_name}])

      # puts "metric_name: :LOC, value: #{file.count($/)}, SyncStep: #{sync_step}, FileName: #{file_name}"
      # log_metric(:Filesize, File.size(file_path), [{name: 'FileName', value: file_name}])
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

    def self.log_metric(metric_name, metric_value, addtl_dimensions = [], metric_units = nil)
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
