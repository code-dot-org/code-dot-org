require File.join(File.expand_path(__FILE__), '../../../deployment')
listen CDO.pegasus_port
worker_processes CDO.pegasus_workers
pid CDO.pegasus_unicorn_pid
timeout 60
stderr_path pegasus_dir('log/unicorn_stderr.log')
stdout_path pegasus_dir('log/unicorn_stdout.log')
working_directory pegasus_dir
#logger $log
