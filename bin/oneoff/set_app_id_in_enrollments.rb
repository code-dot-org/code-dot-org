#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

puts "Updating application_id in enrollments ...\n\n"

total_changed = 0

Pd::Enrollment.where.not(user_id: nil).each do |enrollment|
  old_app_id = enrollment.application_id
  enrollment.set_application_id

  new_app_id = enrollment.application_id
  total_changed += 1 unless new_app_id == old_app_id
end

puts "Finished updating enrollments: set #{total_changed} application ids"
