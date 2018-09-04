require File.join(File.expand_path(__FILE__), '../../../deployment')

if CDO.pegasus_sock
  bind "unix://#{CDO.pegasus_sock}"
else
  bind "tcp://#{CDO.pegasus_host}:#{CDO.pegasus_port}"
end

workers CDO.pegasus_workers unless CDO.pegasus_workers.to_i < 2
threads 8, 16

pidfile "#{File.expand_path(__FILE__)}.pid"

preload_app!

stdout_redirect pegasus_dir('log', 'puma_stdout.log'), pegasus_dir('log', 'puma_stderr.log'), true
directory deploy_dir('pegasus')

on_worker_boot do |_index|
  require 'dynamic_config/gatekeeper'
  require 'dynamic_config/dcdo'
  Gatekeeper.after_fork
  DCDO.after_fork
end
