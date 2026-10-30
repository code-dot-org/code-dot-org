# frozen_string_literal: true

require 'cdo/metric_collector'

module Cdo
  class PumaStatsCollector < MetricCollector
    def snapshot
      stats = Puma.stats_hash
      worker_statuses = stats[:worker_status].map {|w| w[:last_status]}

      {
        'backlog' => worker_statuses.sum {|s| s[:backlog] || 0},
        'running' => worker_statuses.sum {|s| s[:running] || 0},
        'pool_capacity' => worker_statuses.sum {|s| s[:pool_capacity] || 0},
        'busy_threads' => worker_statuses.sum {|s| s[:busy_threads] || 0},
        'max_threads' => worker_statuses.sum {|s| s[:max_threads] || 0},
        'booted_workers' => stats[:booted_workers] || 0
      }
    end

    private def publish(metrics)
      metrics.each do |name, value|
        Cdo::Metrics.put(
          @namespace, name, value, @dimensions,
          storage_resolution: @resolution, unit: 'Count'
        )
        Cdo::Metrics.put(
          @namespace, name, value, @dimensions.merge(InstanceId: instance_id),
          storage_resolution: @resolution, unit: 'Count'
        )
      end
    end

    private def instance_id
      return @instance_id unless @instance_id.nil? || @instance_id == 'UNKNOWN'
      @instance_id = AWS::EC2.instance_id || 'UNKNOWN'
    end
  end
end
