module Cdo
  # Common app-server hook logic shared between multiple application entry-points
  # (e.g., dashboard and pegasus).
  module AppServerHooks
    def self.before_fork
      PEGASUS_DB.disconnect
      DASHBOARD_DB.disconnect
      Cdo::AppServerMetrics.instance&.spawn_reporting_task if defined?(Cdo::AppServerMetrics)

      # Control automated restarts of web application server processes via Gatekeeper.
      # NOTE: before_fork runs on the parent puma process, so complete restart of the web application services on all
      # front end instances is required for a change of this Gatekeeper flag to take effect:
      #   sudo service dashboard upgrade && sudo service pegasus upgrade
      require 'dynamic_config/gatekeeper'
      require 'dynamic_config/dcdo'
      Gatekeeper.after_fork
      DCDO.after_fork

      if Gatekeeper.allows('enableWebServiceProcessRollingRestart')
        require 'puma_worker_killer'

        restart_period = DCDO.get("web_service_process_restart_period", 12 * 3600) # default to 12 hours
        PumaWorkerKiller.enable_rolling_restart(restart_period)
      end
    end

    def self.after_fork(host:)
      require 'cdo/aws/metrics'
      Cdo::Metrics.put('App Server/WorkerBoot', 1, Host: host)
      require 'dynamic_config/gatekeeper'
      require 'dynamic_config/dcdo'
      Gatekeeper.after_fork
      DCDO.after_fork
    end
  end
end
