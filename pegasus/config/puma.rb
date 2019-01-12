require File.join(File.expand_path(__FILE__), '../../../deployment')

if CDO.pegasus_sock
  bind "unix://#{CDO.pegasus_sock}"
else
  bind "tcp://#{CDO.pegasus_host}:#{CDO.pegasus_port}"
end

workers CDO.pegasus_workers
threads 1, 5

drain_on_shutdown

# nginx already buffers/queues requests so disable Puma's own queue.
queue_requests false

pidfile "#{File.expand_path(__FILE__)}.pid"

preload_app!

stdout_redirect pegasus_dir('log', 'puma_stdout.log'), pegasus_dir('log', 'puma_stderr.log'), true
directory deploy_dir('pegasus')

before_fork do
  PEGASUS_DB.disconnect
  DASHBOARD_DB.disconnect
  Cdo::AppServerMetrics.instance&.spawn_reporting_task if defined?(Cdo::AppServerMetrics)

  # Control automated restarts of web application server processes via Gatekeeper.
  # NOTE: before_fork runs on the parent puma process, so complete restart of the web application services on all
  # front end instances is required for a change of this Gatekeeper flag to take effect:
  #   sudo service dashboard upgrade && sudo service pegasus upgrade
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  if Gatekeeper.allows('enableWebServiceProcessRollingRestart')
    require 'puma_worker_killer'

    restart_period = DCDO.get("web_service_process_restart_period", 12 * 3600) # default to 12 hours
    PumaWorkerKiller.enable_rolling_restart(restart_period)
  end
end

on_worker_boot do |_index|
  require 'cdo/aws/metrics'
  Cdo::Metrics.push(
    'App Server',
    [
      {
        metric_name: :WorkerBoot,
        dimensions: [
          {name: "Host", value: CDO.pegasus_hostname}
        ],
        value: 1
      }
    ]
  )
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end

require 'gctools/oobgc'
out_of_band {GC::OOB.run}
