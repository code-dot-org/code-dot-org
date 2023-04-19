#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

puts "Updating application_id in enrollments ...\n\n"

# The method set_application_id is triggered before a save
# Save the enrollment to update set_application_id
Pd::Enrollment.where.not(user_id: nil).each(&:save!)
