require 'cdo/process_memory'

# Preload script cache after initializers are run but before application fork.
# This speeds up load time of new Puma child worker processes
# and Spring application preloader (Rails console, unit tests).
Rails.application.config.to_prepare do
  next unless Unit.should_cache? && !ENV['SKIP_SCRIPT_PRELOAD']

  # Only prewarm in the web application server.
  next unless CDO.running_web_application?

  log_curriculum_preload = lambda do |event, started_at: nil, counts: {}|
    gc = GC.stat
    fields = {
      duration_seconds: started_at && (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at).round(3),
      heap_allocated_pages: gc[:heap_allocated_pages],
      heap_live_slots: gc[:heap_live_slots],
      old_objects: gc[:old_objects],
      total_allocated_objects: gc[:total_allocated_objects]
    }.compact.merge(counts)

    Cdo::ProcessMemory.log_snapshot("curriculum_preload_#{event}", fields: fields)
  end

  started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  log_curriculum_preload.call('started')

  # Populate the in-process curriculum caches from the database.
  Unit.unit_cache_to_cache unless Rails.cache.is_a?(ActiveSupport::Cache::MemoryStore)
  script_cache = Unit.script_cache
  script_level_cache = Unit.script_level_cache
  level_cache = Unit.level_cache
  UnitGroup.course_cache_to_cache unless Rails.cache.is_a?(ActiveSupport::Cache::MemoryStore)
  course_cache = UnitGroup.course_cache

  counts = {
    unit_cache_entries: script_cache.size,
    units: script_cache.values.compact.map(&:object_id).uniq.size,
    script_levels: script_level_cache.size,
    level_cache_entries: level_cache.size,
    levels: level_cache.values.compact.map(&:object_id).uniq.size,
    course_cache_entries: course_cache.size,
    courses: course_cache.values.compact.map(&:object_id).uniq.size
  }

  warmed_records = {}.compare_by_identity
  warmed_class_names = {}
  warmed_class_counts = Hash.new(0)
  warmed_strings = 0
  warmed_associations = 0
  records_to_warm = [
    script_cache.values,
    script_level_cache.values,
    level_cache.values,
    course_cache.values
  ].flatten.compact

  warm_value = nil
  warm_value = lambda do |value|
    case value
    when String
      value.valid_encoding?
      warmed_strings += 1
    when Array
      value.each {|element| warm_value.call(element)}
    when Hash
      value.each do |key, hash_value|
        warm_value.call(key)
        warm_value.call(hash_value)
      end
    end
  end

  begin
    until records_to_warm.empty?
      record = records_to_warm.pop
      next unless record.is_a?(ActiveRecord::Base)
      next if warmed_records[record]

      warmed_records[record] = true
      warmed_class_counts[record.class.name] += 1

      unless warmed_class_names[record.class.name]
        record.class.init_internals if record.class.respond_to?(:init_internals)
        warmed_class_names[record.class.name] = true
      end

      record.attributes.each_value {|value| warm_value.call(value)}

      association_cache = record.instance_variable_get(:@association_cache)
      next unless association_cache

      association_cache.each_value do |association|
        next unless association.loaded?

        warmed_associations += 1
        target = association.target
        target.is_a?(Array) ? records_to_warm.concat(target) : records_to_warm << target
      end
    end
  rescue StandardError => exception
    CDO.log.warn(
      'event=curriculum_preload_warmup_failed ' \
        "error_class=#{exception.class} " \
        "error_message=#{exception.message.inspect}"
    )
  end

  log_curriculum_preload.call(
    'finished',
    started_at: started_at,
    counts: counts.merge(
      warmed_records: warmed_records.size,
      warmed_classes: warmed_class_names.size,
      warmed_associations: warmed_associations,
      warmed_strings: warmed_strings,
      # Per-class record counts, "ClassName:count" sorted by count desc, comma-joined
      # (no spaces, so it stays a single key=value token in the log line). This is the
      # authoritative list of which curriculum models the warm walk actually reached.
      warmed_by_class: warmed_class_counts.sort_by {|_name, count| -count}.map {|name, count| "#{name}:#{count}"}.join(',')
    )
  )
end
