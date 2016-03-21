require File.join(File.expand_path(__FILE__), '../../../deployment')
listen CDO.pegasus_sock || CDO.pegasus_port
worker_processes CDO.pegasus_workers
pid "#{File.expand_path(__FILE__)}.pid"
timeout 60
stderr_path pegasus_dir('log/unicorn_stderr.log')
stdout_path pegasus_dir('log/unicorn_stdout.log')
working_directory pegasus_dir
#logger $log
