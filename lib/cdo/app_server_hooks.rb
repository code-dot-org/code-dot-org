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
      Cdo::Metrics.put('App Server', 'WorkerBoot', 1, {Host: host})

      # Statsig is initialized here for managed environments. For development, it is
      # intialized in config/initializers/statsig.rb
      require 'cdo/statsig'
      Cdo::StatsigInitializer.init

      # FIXME: after_fork is called in puma.rb by on_worker_boot, which doesn't fire when we run Puma
      # in single mode (=local dev, also obvi on thin, since, yeah puma.rb and its a puma API).
      #
      # We maybe need to do this in Puma's "new" on_booted hook
      # see feature request in: https://github.com/puma/puma/issues/1230#issuecomment-839953916
      # merge into puma by this PR in early 2023, probably too new of a puma version for us to take advantage: https://github.com/puma/puma/pull/2709
      # we're on puma 5.6.5 released August 23, 2022, so we could upgrade puma? idk pretty scary for getting a hook
      #
      # The alternative approach is we could detect single-mode, and start the thread directly in that case in puma.rb, and then start it here
      # for after_fork. That might be cleaner anyway, idk, on_booted would potentially start the metrics thread on the cluster master process too?
      start_metric_thread(host: host)
    end

    def self.start_metric_thread(host:)
      puts "Starting metrics thread"
      dimensions = {
        PID: Process.pid,
        Host: host,
      }
      begin
        dimensions[:InstanceId] = AWS::EC2.instance_id
      rescue
        # We're not on EC2, ignore
      end

      Thread.new do
        loop do
          puts "Getting metrics for PID #{Process.pid}"
          # print a line to /tmp/boo.log:
          # File.open("/tmp/boo.log", "a") do |f|
          #   f.puts "ActionCable connections: #{ActionCable.server.connections.count}"
          # end
          Cdo::Metrics.put(
            'ActionCable',
            'ServerConnectionsCount',
            ActionCable.server.connections.count,
            dimensions,
            unit: 'Count'
          )
          sleep 1
        end
      end
    end
  end
end
