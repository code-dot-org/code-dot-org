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
  # Puma runs this hook in each worker process after it forks (cluster mode).
  # When the master preloads the app, the forked worker inherits the parent's in memory New Relic state,
  # including connection and background thread state. New Relic recommends calling `after_fork` in the worker
  # to reset that inherited state and start the agent cleanly inside the worker process.
  #
  # `force_reconnect: true` ensures the worker opens its own connection to the New Relic collector rather than
  # attempting to reuse any inherited connection state from the master process.
  #
  # @see https://www.rubydoc.info/gems/newrelic_rpm/8.16.0/NewRelic%2FAgent:after_fork
  NewRelic::Agent.after_fork(force_reconnect: true) if defined?(NewRelic::Agent)

  Cdo::AppServerHooks.after_fork(host: CDO.dashboard_hostname)
  ActiveRecord::Base.establish_connection
end
