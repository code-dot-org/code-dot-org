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
      Cdo::AppServerMetrics.instance&.spawn_reporting_task if defined?(Cdo::AppServerMetrics)

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

      # Compact heap before forking child puma processes to reduce the number of heap pages occupied by long-lived
      # objects, which reduces the surface area for Copy-on-Write erosion.
      unless @compacted_heap_before_worker_fork
        @compacted_heap_before_worker_fork = true

        begin
          before_gc = GC.stat
          started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          CDO.log.info(
            'Compacting Ruby heap before Puma worker fork: ' \
              "heap_allocated_pages=#{before_gc[:heap_allocated_pages]}, " \
              "heap_live_slots=#{before_gc[:heap_live_slots]}, " \
              "old_objects=#{before_gc[:old_objects]}"
          )

          GC.start(full_mark: true, immediate_sweep: true)
          GC.compact

          after_gc = GC.stat
          duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at
          CDO.log.info(
            'Compacted Ruby heap before Puma worker fork: ' \
              "duration_seconds=#{duration.round(3)}, " \
              "heap_allocated_pages=#{after_gc[:heap_allocated_pages]}, " \
              "heap_live_slots=#{after_gc[:heap_live_slots]}, " \
              "old_objects=#{after_gc[:old_objects]}"
          )
        rescue StandardError => exception
          CDO.log.warn("Failed to compact Ruby heap before Puma worker fork: #{exception.class}: #{exception.message}")
        end
      end
    end

    def self.before_worker_boot(host:)
      require 'cdo/aws/metrics'
      Cdo::Metrics.put('App Server', 'WorkerBoot', 1, {Host: host})

      # Statsig is initialized here for managed environments. For development, it is
      # initialized in config/initializers/statsig.rb
      require 'cdo/statsig'
      Cdo::StatsigInitializer.init
    end

    def self.after_booted
      # Publish puma metrics in production, the managed test server, and adhoc environments.
      if CDO.rack_env?(:production) || CDO.test_system? || CDO.rack_env?(:adhoc)
        require 'cdo/app_server_metrics'

        # Default to High Resolution (1s) for Production/Test.
        interval = 1
        resolution = 1

        # Use Standard Resolution (60s) for Adhoc to save costs.
        if CDO.rack_env?(:adhoc)
          interval = 60
          resolution = 60
        end

        @metrics_reporter ||= Cdo::AppServerMetrics.new(
          interval: interval,
          resolution: resolution,
          dimensions: {
            Environment: CDO.rack_env,
            Host: CDO.dashboard_hostname
          }
        )
        @metrics_reporter.start_puma_reporting
      end
    end
  end
end
