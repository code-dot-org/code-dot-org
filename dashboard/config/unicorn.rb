path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path

listen CDO.dashboard_sock || CDO.dashboard_port
worker_processes CDO.dashboard_workers
pid "#{File.expand_path(__FILE__)}.pid"
timeout 60
preload_app true
stderr_path dashboard_dir('log','unicorn_stderr.log')
stdout_path dashboard_dir('log','unicorn_stdout.log')
working_directory deploy_dir('dashboard')
#logger $log

after_fork do |_server, _worker|
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end
