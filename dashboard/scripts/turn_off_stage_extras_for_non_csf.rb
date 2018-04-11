#!/usr/bin/env ruby
# Update all non-CSF sections that have Lesson Extras enabled to turn off Lesson Extras.
require_relative('../config/environment')

puts 'Starting to batch update all non-CSF sections with Lesson Extras enabled.'
puts "Total sections: #{Section.count}"

num_sections_scanned = 0
num_sections_updated = 0

batch_size = 10000

Section.where.not(stage_extras: false, script_id: Script.csf_script_ids).in_batches(of: batch_size) do |sections|
  values = sections.pluck(:id, :stage_extras, :user_id)
  values = values.map do |id, _, user_id|
    [id, false, user_id]
  end
  result = Section.import([:id, :stage_extras, :user_id], values, validate: false, on_duplicate_key_update: [:stage_extras])
  num_sections_updated += result.num_inserts
  num_sections_scanned += values.length
  puts "Scanned #{num_sections_scanned} sections so far (#{num_sections_updated} updated)."
end

puts "Finished scanning #{num_sections_updated} matching sections (#{num_sections_updated} updated)."
