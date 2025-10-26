# Preload script cache before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).

ChatClient.log "script_preload.rb: rake? #{File.basename($0) == 'rake'} Should cache? #{Unit.should_cache?} skip? #{!!ENV['SKIP_SCRIPT_PRELOAD']}"

# Skip if this is running a Rake task (e.g. rake db:setup) or when caching is disabled
if File.basename($0) != 'rake' &&
    Unit.should_cache? &&
    !ENV['SKIP_SCRIPT_PRELOAD']
  # Populate the shared in-memory cache from the database.
  ChatClient.log "script_preload.rb: Populating cache..."
  start_time = Time.now
  Unit.unit_cache_to_cache unless Rails.cache.is_a?(ActiveSupport::Cache::MemoryStore)
  Unit.script_cache
  Unit.script_level_cache
  Unit.level_cache
  UnitGroup.course_cache_to_cache unless Rails.cache.is_a?(ActiveSupport::Cache::MemoryStore)
  UnitGroup.course_cache
  ChatClient.log "script_preload.rb: Cache populated in #{(Time.now - start_time).to_i} seconds"
end
