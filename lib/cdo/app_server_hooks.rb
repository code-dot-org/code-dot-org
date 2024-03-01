module Cdo
  # Common app-server hook logic shared between multiple application entry-points
  # (e.g., dashboard and pegasus).
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
    end

    def self.after_fork(host:)
      require 'cdo/aws/metrics'
      Cdo::Metrics.put('App Server/WorkerBoot', 1, Host: host)

      # Statsig is initialized here for managed environments. For development, it is
      # intialized in config/initializers/statsig.rb
      require 'statsig'
      # Determine if this is the managed Test web application server
      managed_test_environment = CDO.running_web_application? && CDO.test_system?
      # Enable local_mode for all environments except Production and our managed Test
      # web application server. This is done to keep parity between those two
      # environments. Anything else that runs on the Test server, as well as
      # code that executes in the continous integration builds, will run in local_mode.
      # This limits the number of metrics we emit, thereby lowering our credit usage.
      local_mode = CDO.rack_env?(:production) || managed_test_environment ? false : true
      options = StatsigOptions.new({'tier' => CDO.rack_env}, network_timeout: 5, local_mode: local_mode)
      # Initialize Statsig
      Statsig.initialize(CDO.statsig_server_secret_key, options)
    end
  end
end
