require 'cdo/aws/metrics'
require 'honeybadger/ruby'
require 'concurrent/timer_task'

module Cdo
  # Collect puma web application server statistics and publish to AWS CloudWatch.
  class AppServerMetrics
    def initialize(opts = {})
      @namespace = opts[:namespace] || 'App Server'
      @dimensions = opts[:dimensions] || {}

      # Default to 1 if not provided, or use the dynamic values from hooks.
      @interval = opts[:interval] || 1
      @resolution = opts[:resolution] || 1

      @instance_id = 'UNKNOWN'
    end

    # Fetch or retry the ID.
    def instance_id
      return @instance_id unless @instance_id == 'UNKNOWN'

      # Attempt fetch.
      if (fetched_id = AWS::EC2.instance_id)
        @instance_id = fetched_id
      end

      @instance_id
    end

    def shutdown
      @spawn_reporting_task&.shutdown
    end

    def start_puma_reporting
      # If we already have a running task, don't start another.
      return @spawn_reporting_task if @spawn_reporting_task&.running?

      @spawn_reporting_task = Concurrent::TimerTask.new(execution_interval: @interval) {|task| collect_puma_stats(task)}.
        with_observer {|_, _, ex| Honeybadger.notify(ex) if ex}.
        execute
    end

    # Periodically collect puma metrics.
    def collect_puma_stats(*_)
      namespace = @namespace
      dimensions = @dimensions

      # Puma.stats_hash provides the true internal state of all workers
      stats = Puma.stats_hash
      worker_statuses = stats[:worker_status].map {|w| w[:last_status]}

      # Aggregate metrics across the entire cluster on this instance
      metrics = {
        'backlog' => worker_statuses.sum {|s| s[:backlog] || 0},
        'running' => worker_statuses.sum {|s| s[:running] || 0},
        'pool_capacity' => worker_statuses.sum {|s| s[:pool_capacity] || 0},
        'booted_workers' => stats[:booted_workers] || 0
      }

      metrics.each do |name, value|
        # Public Deployment-level (Environment + Host) metrics.
        Cdo::Metrics.put(
          namespace,
          name,
          value,
          dimensions,
          storage_resolution: @resolution,
          unit: 'Count'
        )

        # Retrieve the best available ID (UNKNOWN or real i-xxxx).
        current_instance_id = instance_id

        # Public Instance-level (Environment + Host + InstanceId) metrics.
        Cdo::Metrics.put(
          namespace,
          name,
          value,
          dimensions.merge(InstanceId: current_instance_id),
          storage_resolution: @resolution,
          unit: 'Count'
        )
      end
    end
  end
end
