#!/usr/bin/env ruby
# Update all students under age 13, or with age not set, to have sharing_disabled = true.
# sharing_disabled is contained in properties of the User model
require_relative('../config/environment')

puts "Starting to batch update all students under 13."
num_students_updated = 0

min_birthday = Date.today - 13.years
User.where('birthday IS NULL OR birthday > ?', min_birthday).find_each do |user|
  user.update! sharing_disabled: true
  num_students_updated += 1
  puts "Updated #{num_students_updated} students so far." if num_students_updated % 100000 == 0
end

# Output how many total students were updated.
puts "Finished updating #{num_students_updated} students."
