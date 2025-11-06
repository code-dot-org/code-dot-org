path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path

if CDO.dashboard_sock
  bind "unix://#{CDO.dashboard_sock}"
else
  bind "tcp://#{CDO.dashboard_host}:#{CDO.dashboard_port}"
end

# workers CDO.dashboard_workers
workers 2 # FIXME: remove, temporarily set to 2 (default = 0 which uses single-mode) so we can run our changes on puma in dev, see app_server_hooks.rb for FIXME comment
threads 1, 5

directory deploy_dir('dashboard')

unless CDO.rack_env?(:development)
  drain_on_shutdown

  # nginx already buffers/queues requests so disable Puma's own queue.
  queue_requests false

  pidfile "#{File.expand_path(__FILE__)}.pid"
  preload_app!

  stdout_redirect dashboard_dir('log', 'puma_stdout.log'), dashboard_dir('log', 'puma_stderr.log'), true
end

require 'cdo/app_server_hooks'
before_fork do
  ActiveRecord::Base.connection_pool.disconnect!
  Cdo::AppServerHooks.before_fork
  puts "BEFORE THE WORK"
end

puts "IS THERE ANYBODY OUT THERE??"

on_worker_boot do |_index|
  puts "IN THE WORKER BOOT"
  Cdo::AppServerHooks.after_fork(host: CDO.dashboard_hostname)
  ActiveRecord::Base.establish_connection
end
