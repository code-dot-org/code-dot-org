#!/usr/bin/env ruby
require_relative('../config/environment')

# Mark teachers in any cohort as an authorized teacher. Preparation for removing
# the Cohorts table.
#
# See: https://github.com/code-dot-org/code-dot-org/blob/dce73fb777e4438f0aae3e2c79f53665161593fb/dashboard/app/models/user.rb#L1123

teacher_ids = Cohort.all.map {|cohort| cohort.teachers.pluck(:id)}.flatten.uniq
puts "Updating #{teacher_ids.count} teachers in any cohort to be authorized teachers..."

User.where(id: teacher_ids).each do |user|
  user.permission = UserPermission::AUTHORIZED_TEACHER
end

puts 'Done'
