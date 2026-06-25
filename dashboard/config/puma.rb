path = File.expand_path('../../deployment.rb', __FILE__)
path = File.expand_path('../../../deployment.rb', __FILE__) unless File.file?(path)
require path
require 'concurrent' # Need for `:auto`
CDO.execution_context = :web_application

if CDO.dashboard_sock
  bind "unix://#{CDO.dashboard_sock}"
else
  bind "tcp://#{CDO.dashboard_host}:#{CDO.dashboard_port}"
end

# `:auto` Uses `Concurrent.available_processor_count`, rounded down if the result is fractional.
worker_count = CDO.dashboard_workers.is_a?(Numeric) ? CDO.dashboard_workers : :auto
workers worker_count
threads 1, 5

directory deploy_dir('dashboard')

unless CDO.rack_env?(:development)
  drain_on_shutdown

  # nginx already buffers/queues requests so disable Puma's own queue.
  queue_requests false

  pidfile "#{File.expand_path(__FILE__)}.pid"
  preload_app!

  # In clustered mode, tell Rails initializers they are running in the
  # cluster master during preload. The master must not start threads that
  # resolve DNS: a worker forked while such a thread is inside getaddrinfo
  # inherits glibc's internal __check_pf lock in the locked state, and every
  # subsequent DNS lookup in that worker deadlocks (uninterruptibly, since
  # the socket extension calls getaddrinfo without an unblock function).
  # See config/initializers/statsig.rb; workers initialize Statsig in
  # Cdo::AppServerHooks.before_worker_boot instead.
  # (Not CDO_-prefixed: lib/cdo.rb treats CDO_* env vars as config properties
  # and rejects ones not declared in config.yml.erb.)
  ENV['PUMA_CLUSTER_PRELOAD'] = '1' unless worker_count == 0

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
