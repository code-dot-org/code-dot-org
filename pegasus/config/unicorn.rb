require File.join(File.expand_path(__FILE__), '../../../deployment')
listen '/run/unicorn/pegasus.sock'
worker_processes CDO.pegasus_workers
pid '/run/unicorn/pegasus.pid'
timeout 60
stderr_path log_dir('pegasus', 'unicorn_stderr.log')
stdout_path log_dir('pegasus', 'unicorn_stdout.log')
working_directory pegasus_dir
#logger $log
