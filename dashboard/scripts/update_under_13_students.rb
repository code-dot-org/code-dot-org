#!/usr/bin/env ruby
# Update all students under age 13, or with age not set, to have sharing_disabled = true.
# sharing_disabled is contained in properties of the User model
require_relative('../config/environment')

puts "Starting to batch update all students under 13."
num_students_updated = 0

batch_size = 10000
min_birthday = Date.today - 13.years
User.where('birthday IS NULL OR birthday > ?', min_birthday).in_batches(of: batch_size) do |where|
  values = where.pluck(:id, :properties)
  values = values.map do |id, properties|
    if properties
      properties['sharing_disabled'] = true
    else
      properties = {'sharing_disabled': true}
    end
    [id, properties]
  end
  User.import([:id, :properties], values, validate: false, on_duplicate_key_update: [:properties])
  num_students_updated += values.length
  puts "Updated #{num_students_updated} students so far."
end

# Output how many total students were updated.
puts "Finished updating #{num_students_updated} students."
