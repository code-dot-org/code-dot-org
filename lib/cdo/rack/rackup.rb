module Rack
  def self.with_rackup(dir, params={})
    port = params[:port] || 3000
    log = '/dev/null'

    pid = 0
    Dir.chdir(dir) do
      env = {'RACK_ENV'=>rack_env.to_s, 'RAILS_ENV'=>rack_env.to_s}
      pid = Process.spawn(env, 'bundle', 'exec', 'rackup', '-p', "#{port}", 'config.ru', [:out, :err] => log)
      sleep 5 # Give the process time to start.
    end

    at_exit do
      Process.kill('TERM', pid)
      Process.wait(pid)
    end

    yield params if block_given?
  end
end
