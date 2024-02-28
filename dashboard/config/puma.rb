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

# Statsig is initialized here for managed environments. For development, it is
# intialized in config/initializers/statsig.rb
require 'statsig'
# Determine if this is a managed test environment
managed_test_environment = CDO.running_web_application? && CDO.test_system?
# Enable local_mode for all environments except prod and test. This limits the
# amount of metrics we emit, thereby lowering our credit usage.
local_mode = CDO.rack_env?(:production) || managed_test_environment ? false : true
options = StatsigOptions.new({'tier' => CDO.rack_env}, network_timeout: 5, local_mode: local_mode)

on_worker_boot do |_index|
  Statsig.initialize(CDO.statsig_server_secret_key, options)
  Cdo::AppServerHooks.after_fork(host: CDO.dashboard_hostname)
  ActiveRecord::Base.establish_connection
end
