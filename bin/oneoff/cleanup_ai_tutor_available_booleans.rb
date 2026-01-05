#!/usr/bin/env ruby

# This script cleans all levels where ai_tutor_available was set to a boolean value
#
# The ai_tutor_available property is stored as the string "true"/"false" in
# Level#properties, matching Level#ai_tutor_available?.
#
# This script updates each Level via save! so that after_save callbacks run
# (specifically LevelFiles.write_custom_level_file)

require_relative '../../dashboard/config/environment'
require 'cdo/db'

dry_run = ARGV.include?('--dry-run')

counts = {
  is_true: 0,
  is_false: 0
}

time_taken = Benchmark.realtime do
  ActiveRecord::Base.transaction do
    # Clean up existing ai_tutor_available json booleans to strings
    Level.where("properties->'$.ai_tutor_available' = true").find_each(batch_size: 100) do |level|
      level.properties['ai_tutor_available'] = 'true' unless dry_run
      level.save! unless dry_run
      counts[:is_true] += 1
    end
    Level.where("properties->'$.ai_tutor_available' = false").find_each(batch_size: 100) do |level|
      level.properties['ai_tutor_available'] = 'false' unless dry_run
      level.save! unless dry_run
      counts[:is_false] += 1
    end
  end
end

puts "It took #{time_taken} seconds to update ai_tutor_available:"
puts "Level cleaning -> true: #{counts[:is_true]}, false: #{counts[:is_false]} levels containing boolean value rather than string value."
