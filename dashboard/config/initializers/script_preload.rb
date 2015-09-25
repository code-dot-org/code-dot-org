# Preload script cache before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).

# Skip if this is running a Rake task (e.g. rake db:setup), or we're in
# test mode and the FAST_TEST environment variable is set.
unless File.basename($0) == 'rake' || (ENV['FAST_TEST'] && Rails.env.test?)
  Script.script_cache
end
