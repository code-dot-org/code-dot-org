# Preload script cache before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).

# Skip if this is running a Rake task (e.g. rake db:setup or rake test)
if File.basename($0) == 'rake' || ENV['FAST_START']
  Rails.logger.info 'Skipping script cache preload'
else
  Rails.logger.info 'Preloading script cache'
  Script.script_cache
end
