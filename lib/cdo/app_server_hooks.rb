module Cdo
  # NOTE: these hooks are only executed when running in puma clustered mode, which spawns worker processes.
  # These hooks will NOT be run in local development unless you set `dashboard_workers: 1` (or greater)
  # in locals.yml, which enables clustered mode.
  module AppServerHooks
    def self.before_fork
      # rubocop:disable CustomCops/PegasusDbUsage
      # rubocop:disable CustomCops/DashboardDbUsage
      PEGASUS_DB.disconnect
      DASHBOARD_DB.disconnect
      # rubocop:enable CustomCops/PegasusDbUsage
      # rubocop:enable CustomCops/DashboardDbUsage
      @metrics_reporter&.start

      # Control automated restarts of web application server processes via Gatekeeper and DCDO.
      # NOTE: before_fork runs on the parent puma process, so complete restart of the web application services on all
      # front end instances is required for a change of these Gatekeeper and DCDO flags to take effect:
      #   sudo systemctl restart dashboard && sudo systemctl restart pegasus
      require 'dynamic_config/gatekeeper'
      require 'dynamic_config/dcdo'

      if Gatekeeper.allows('enableWebServiceProcessRollingRestart')
        require 'puma_worker_killer'

        restart_period = DCDO.get('web_service_process_restart_period', 12 * 3600) # default to 12 hours
        PumaWorkerKiller.enable_rolling_restart(restart_period)
      end
    end

    def self.before_worker_boot(host:, worker_index: nil)
      require 'cdo/aws/metrics'
      Cdo::Metrics.put('App Server', 'WorkerBoot', 1, {Host: host})

      # Publish per-worker memory metrics in production, the managed test server, and adhoc environments.
      # DCDO hash: { "interval_seconds" => N, "per_instance" => bool }
      # interval_seconds: 0 = off, >0 = collection interval in seconds.
      # per_instance: when true, adds InstanceId + WorkerIndex for per-EC2-worker tracking (higher cardinality/cost).
      #   Without per_instance, WorkerIndex is omitted because multiple EC2 instances share the same Host,
      #   making WorkerIndex ambiguous. The fleet-aggregate view (Host-only) is still useful for trends.
      config = DCDO.get('worker_memory_metrics', {})
      interval = (config['interval_seconds'] || 0).to_i
      if (CDO.rack_env?(:production) || CDO.test_system? || CDO.rack_env?(:adhoc)) &&
          interval > 0 &&
          worker_index
        require 'cdo/worker_memory_collector'
        dimensions = {Host: CDO.dashboard_hostname}
        if config['per_instance']
          require 'cdo/aws/ec2'
          instance_id = AWS::EC2.instance_id
          if instance_id
            dimensions[:InstanceId] = instance_id
            dimensions[:WorkerIndex] = worker_index.to_s
          end
        end
        Cdo::WorkerMemoryCollector.new(
          namespace: 'App Server',
          interval: interval,
          resolution: interval,
          dimensions: dimensions
        ).start
      end

      # Statsig is initialized here for managed environments. For development, it is
      # initialized in config/initializers/statsig.rb
      require 'cdo/statsig'
      Cdo::StatsigInitializer.init
    end

    def self.after_booted
      # Publish puma metrics in production, the managed test server, and adhoc environments.
      return unless CDO.rack_env?(:production) || CDO.test_system? || CDO.rack_env?(:adhoc)

      require 'cdo/puma_stats_collector'

      interval = CDO.rack_env?(:adhoc) ? 60 : 1
      resolution = interval

      @metrics_reporter ||= Cdo::PumaStatsCollector.new(
        namespace: 'App Server',
        interval: interval,
        resolution: resolution,
        dimensions: {
          Environment: CDO.rack_env,
          Host: CDO.dashboard_hostname
        }
      )
      @metrics_reporter.start
    end
  end
end
