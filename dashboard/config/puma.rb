path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path

if CDO.dashboard_sock
  bind "unix://#{CDO.dashboard_sock}"
else
  bind "tcp://#{CDO.dashboard_host}:#{CDO.dashboard_port}"
end
workers CDO.dashboard_workers unless CDO.dashboard_workers.to_i < 2
threads 8, 16

pidfile "#{File.expand_path(__FILE__)}.pid"
preload_app!
stdout_redirect dashboard_dir('log', 'puma_stdout.log'), dashboard_dir('log', 'puma_stderr.log'), true
directory deploy_dir('dashboard')

before_fork do
  ActiveRecord::Base.connection_pool.disconnect!
end

on_worker_boot do |_index|
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end
