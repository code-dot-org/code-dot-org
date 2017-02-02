# Shared Unicorn-configuration components.

# `before_fork` block to support zero-downtime
# `upgrade` sysvinit service target.
# Use in conjunction with an init script that never signals
# QUIT to the old Unicorn process itself on upgrade.
$unicorn_upgrade = proc do |server, _worker|
  # Quit the old unicorn process
  old_pid = "#{server.config[:pid]}.oldbin"
  if File.exist?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
      # someone else did our job for us
    end
  end
end
