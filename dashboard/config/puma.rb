path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path

if CDO.dashboard_sock
  bind "unix://#{CDO.dashboard_sock}"
else
  bind "tcp://#{CDO.dashboard_host}:#{CDO.dashboard_port}"
end
workers CDO.dashboard_workers
threads 1, 5

drain_on_shutdown

# nginx already buffers/queues requests so disable Puma's own queue.
queue_requests false

pidfile "#{File.expand_path(__FILE__)}.pid"
preload_app!
stdout_redirect dashboard_dir('log', 'puma_stdout.log'), dashboard_dir('log', 'puma_stderr.log'), true
directory deploy_dir('dashboard')

require 'cdo/app_server_hooks'
before_fork do
  ActiveRecord::Base.connection_pool.disconnect!
  Cdo::AppServerHooks.before_fork
end

on_worker_boot do |_index|
  Cdo::AppServerHooks.after_fork(host: CDO.dashboard_hostname)
  ActiveRecord::Base.establish_connection
end

require 'gctools/oobgc'
out_of_band {GC::OOB.run}

# Log thread backtraces and GC stats from all worker processes every second when enabled.
plugin :log_stats
LogStats.threshold = -> {DCDO.get('logStatsDashboard', nil)}
filter_gems = %w(puma sinatra actionview activesupport honeybadger newrelic rack)
LogStats.backtrace_filter = ->(bt) {CDO.filter_backtrace(bt, filter_gems: filter_gems)}
