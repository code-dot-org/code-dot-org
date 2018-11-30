require File.join(File.expand_path(__FILE__), '../../../deployment')
listen CDO.pegasus_sock || CDO.pegasus_port
worker_processes CDO.pegasus_workers
pid "#{File.expand_path(__FILE__)}.pid"
timeout 60
preload_app true
stderr_path pegasus_dir('log/unicorn_stderr.log')
stdout_path pegasus_dir('log/unicorn_stdout.log')
working_directory pegasus_dir
#logger $log

after_fork do |_server, _worker|
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end

require 'cdo/unicorn'
before_fork do |server, worker|
  Cdo::AppServerMetrics.instance&.spawn_reporting_task if defined?(Cdo::AppServerMetrics)
  $unicorn_upgrade.call server, worker
end
