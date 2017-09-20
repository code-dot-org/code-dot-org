require 'cdo/school_autocomplete'

# Preload the SchoolAutocomplete singleton instance.
# Skip if this is running a Rake task (e.g. rake db:setup) or when caching is disabled

if File.basename($0) != 'rake' && !Rails.application.config.skip_preload_schools
  startTime = Time.now
  SchoolAutocomplete.instance
  endTime = Time.now
  puts "[#{endTime.strftime('%c')}] Preloaded schools in #{endTime - startTime} second(s)"
end
