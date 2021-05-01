#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

workshops = Pd::Workshop.future.
  where("pd_workshops.properties LIKE '%\"virtual\":true%'").
  where("pd_workshops.course": ["CS Principles", "CS Discoveries"])

CSV.open(ARGV[0], 'wb') do |csv|
  csv << ['teacher email', 'teacher id', 'teacher name', 'enrollment date']
  workshops.each do |workshop|
    workshop.enrollments.each do |enrollment|
      csv << [enrollment.email.to_s, enrollment.user_id.to_s, "#{enrollment.first_name} #{enrollment.last_name}", enrollment.created_at.to_s]
    end
  end
end
