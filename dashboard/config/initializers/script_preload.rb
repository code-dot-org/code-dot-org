# Preload script cache before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).

# Skip if this is running a Rake task (e.g. rake db:setup)
unless File.basename($0) == 'rake'
  Script.script_cache
end
