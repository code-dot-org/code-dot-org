module Cdo
  # Common app-server hook logic shared between multiple application entry-points
  module AppServerHooks
    def self.before_fork
      # rubocop:disable CustomCops/DashboardDbUsage
      DASHBOARD_DB.disconnect
      # rubocop:enable CustomCops/DashboardDbUsage
      Cdo::AppServerMetrics.instance&.spawn_reporting_task if defined?(Cdo::AppServerMetrics)

      # Control automated restarts of web application server processes via Gatekeeper and DCDO.
      # NOTE: before_fork runs on the parent puma process, so complete restart of the web application services on all
      # front end instances is required for a change of these Gatekeeper and DCDO flags to take effect:
      #   sudo systemctl restart dashboard
      require 'dynamic_config/gatekeeper'
      require 'dynamic_config/dcdo'

      if Gatekeeper.allows('enableWebServiceProcessRollingRestart')
        require 'puma_worker_killer'

        restart_period = DCDO.get('web_service_process_restart_period', 12 * 3600) # default to 12 hours
        PumaWorkerKiller.enable_rolling_restart(restart_period)
      end
    end

    def self.after_fork(host:)
      Cdo::Metrics.put('App Server', 'WorkerBoot', 1, Host: host)
    end
  end
end
