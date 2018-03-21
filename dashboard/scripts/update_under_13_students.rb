#!/usr/bin/env ruby
# Update all students under age 13, or with age not set, to have sharing_disabled = true.
# sharing_disabled is contained in properties of the User model
require_relative('../config/environment')

puts "Starting to batch update all students under 13"

min_birthday = Date.today - 13.years
users = User.where('birthday IS NULL OR birthday > ?', min_birthday)
users.each do |user|
  user.update! sharing_disabled: true
end

# Output how many total students were updated.
puts "Finished updating #{users.count} students"
