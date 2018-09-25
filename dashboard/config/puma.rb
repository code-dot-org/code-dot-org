path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path

if CDO.dashboard_sock
  bind "unix://#{CDO.dashboard_sock}"
else
  bind "tcp://#{CDO.dashboard_host}:#{CDO.dashboard_port}"
end
workers CDO.dashboard_workers unless CDO.dashboard_workers.to_i < 2
threads 1, 5

drain_on_shutdown

# nginx already buffers/queues requests so disable Puma's own queue.
queue_requests false

pidfile "#{File.expand_path(__FILE__)}.pid"
preload_app!
stdout_redirect dashboard_dir('log', 'puma_stdout.log'), dashboard_dir('log', 'puma_stderr.log'), true
directory deploy_dir('dashboard')

before_fork do
  PEGASUS_DB.disconnect
  DASHBOARD_DB.disconnect
  ActiveRecord::Base.connection_pool.disconnect!
  Cdo::AppServerMetrics.instance&.spawn_reporting_task if defined?(Cdo::AppServerMetrics)
end

on_worker_boot do |_index|
  ActiveRecord::Base.establish_connection
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end

require 'gctools/oobgc'
out_of_band {GC::OOB.run}
