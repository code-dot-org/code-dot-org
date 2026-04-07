# Preload script cache after initializers are run but before application fork.
# This speeds up load time of new Unicorn child worker processes
# and Spring application preloader (Rails console, unit tests).
Rails.application.config.to_prepare do
  ChatClient.log "Unit.should_cache?=#{Unit.should_cache?}, SKIP_SCRIPT_PRELOAD=#{ENV.fetch('SKIP_SCRIPT_PRELOAD', nil)}"
  next unless Unit.should_cache? && !ENV['SKIP_SCRIPT_PRELOAD']
  ChatClient.log "Preloading script cache in #{Rails.env} environment"

  # Populate the shared in-memory cache from the database.
  Unit.unit_cache_to_cache unless Rails.cache.is_a?(ActiveSupport::Cache::MemoryStore)
  Unit.script_cache
  Unit.script_level_cache
  Unit.level_cache
  UnitGroup.course_cache_to_cache unless Rails.cache.is_a?(ActiveSupport::Cache::MemoryStore)
  UnitGroup.course_cache
end
