require File.join(File.expand_path(__FILE__), '../../../deployment')

if CDO.pegasus_sock
  bind "unix://#{CDO.pegasus_sock}"
else
  bind "tcp://#{CDO.pegasus_host}:#{CDO.pegasus_port}"
end

workers CDO.pegasus_workers
threads 1, 5

drain_on_shutdown

# nginx already buffers/queues requests so disable Puma's own queue.
queue_requests false

pidfile "#{File.expand_path(__FILE__)}.pid"

preload_app!

stdout_redirect pegasus_dir('log', 'puma_stdout.log'), pegasus_dir('log', 'puma_stderr.log'), true
directory deploy_dir('pegasus')

require 'cdo/app_server_hooks'
before_fork do
  Cdo::AppServerHooks.before_fork
end

on_worker_boot do |_index|
  Cdo::AppServerHooks.after_fork(host: CDO.pegasus_hostname)
end

# Temporarily wrap this middleware in a DCDO flag so we can evaluate whether or
# not this still has a performance impact on this version of Ruby
# TODO: either remove the flag or this entire block, depending on the results
require 'dynamic_config/dcdo'
unless DCDO.get('oobgc_middleware_disabled', false)
  require 'gctools/oobgc'
  out_of_band {GC::OOB.run}
end
