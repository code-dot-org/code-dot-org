listen '/run/unicorn/dashboard.sock'
worker_processes 1
pid "/home/kitchen/dashboard.pid"
timeout 60
preload_app true
stderr_path '/home/kitchen/dashboard_unicorn_stderr.log'
stdout_path '/home/kitchen/dashboard_unicorn_stdout.log'
working_directory '/home/kitchen'
