# Preload script cache before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).

# Skip if this is running a Rake task outside of Spring (e.g. rake db:setup)
unless File.basename($0) == 'rake' && !defined?(Spring)
  Script.script_cache
end
