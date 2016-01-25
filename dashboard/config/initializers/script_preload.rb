# Preload script cache before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).

# Skip if this is running a Rake task (e.g. rake db:setup) or when caching is disabled
unless File.basename($0) == 'rake' || !Script.should_cache?
  # Populate the shared in-memory cache from the database.
  Script.script_cache_to_cache
  Script.script_cache
  Script.script_level_cache
  Script.level_cache
end
