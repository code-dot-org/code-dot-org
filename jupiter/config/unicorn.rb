require File.join(File.expand_path(__FILE__), '../../../deployment')
listen CDO.jupiter_port
worker_processes CDO.jupiter_workers
pid "#{File.expand_path(__FILE__)}.pid"
timeout 60
stderr_path jupiter_dir('log','unicorn_stderr.log')
stdout_path jupiter_dir('log','unicorn_stdout.log')
working_directory jupiter_dir
#logger $log
