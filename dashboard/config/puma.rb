path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path
Cdo.execution_context = :web_application

if CDO.dashboard_sock
  bind "unix://#{CDO.dashboard_sock}"
else
  bind "tcp://#{CDO.dashboard_host}:#{CDO.dashboard_port}"
end

workers CDO.dashboard_workers
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
end

before_worker_boot do |_index|
  Cdo::AppServerHooks.before_worker_boot(host: CDO.dashboard_hostname)
  ActiveRecord::Base.establish_connection
end

# Code to run in the Puma parent process after it boots, and also after a phased restart completes.
after_booted do
  Cdo::AppServerHooks.after_booted
end

# Enable the Puma control server with a Unix socket.
if CDO.puma_control_server_token
  control_socket = "unix://#{dashboard_dir(CDO.puma_control_server_relative_socket_path)}"
  activate_control_app control_socket, {auth_token: CDO.puma_control_server_token}
end
