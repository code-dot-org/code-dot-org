path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path

listen '/run/unicorn/dashboard.sock'
worker_processes CDO.dashboard_workers
pid '/run/unicorn/dashboard.pid'
timeout 60
preload_app true
stderr_path log_dir('dashboard', 'unicorn_stderr.log')
stdout_path log_dir('dashboard', 'unicorn_stdout.log')
working_directory deploy_dir('dashboard')
#logger $log

after_fork do |server, worker|
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end
