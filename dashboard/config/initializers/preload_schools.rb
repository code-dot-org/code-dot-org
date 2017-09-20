require 'cdo/school_autocomplete'

#
# Preload the SchoolAutocomplete singleton instance.
#

if !Rails.application.config.skip_preload_schools
  startTime = Time.now
  SchoolAutocomplete.instance
  endTime = Time.now
  puts "[#{endTime.strftime('%c')}] Preloaded schools in #{endTime - startTime} second(s)"
end
