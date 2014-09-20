def only_one_running?(script)
  pidfile = "#{File.expand_path(script)}.pid"
  if File.exists?(pidfile)
    oldpid = File.read(pidfile).to_i
    # does that process exist?
    exists = true
    begin
      Process.kill(0, oldpid)
    rescue Errno::ESRCH
      File.delete(pidfile)
      exists = false
    rescue ::Exception   # for example on EPERM (process exists but does not belong to us)
      exists = true
    end
    return false if exists
  end
  File.open(pidfile, "w") { |f| f.puts $$ }
  at_exit { File.unlink(pidfile) }
  true
end
