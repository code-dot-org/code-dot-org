#!/usr/bin/env ruby
require_relative '../config/environment'
require 'csv'

COL_USER_ID = 'Code Studio ID'.freeze
COL_EMAIL = 'Email Address'.freeze
COL_COURSES = 'Program'.freeze

facilitators_csv = ARGV[0]
unless facilitators_csv
  puts 'Usage: import_course_facilitators facilitators.csv'
  exit
end

class CSV::Row
  def [](header)
    raw_value = field header
    return nil unless raw_value
    raw_value.strip
  end
end

# First pass, validate the data.
course_facilitator_list = []
CSV.foreach(facilitators_csv, headers: true) do |row|
  user_id = row[COL_USER_ID]
  email = row[COL_EMAIL]

  next unless email || user_id

  # Some facilitators don't have accounts yet and are marked with - followed by a comment in the id field.
  next if user_id && user_id.start_with?('-')
  facilitator =
    if user_id.nil?
      User.find_by!(email: email) rescue raise "Unable to find user email #{email}"
    else
      User.find_by!(id: user_id) rescue raise "Unable to find user id #{user_id}"
    end

  courses = row[COL_COURSES].split(',').map(&:strip)
  courses.each do |course|
    raise "Unrecognized course #{course}" unless Pd::Workshop::COURSES.include? course
    course_facilitator_list << {facilitator: facilitator, course: course}
  end
end

# Second pass, import the data.
course_facilitator_list.each do |course_facilitator|
  facilitator = course_facilitator[:facilitator]
  Pd::CourseFacilitator.find_or_create_by facilitator_id: facilitator.id, course: course_facilitator[:course]

  # CSF facilitators are also workshop organizers
  facilitator.permission = UserPermission::WORKSHOP_ORGANIZER if course_facilitator[:course] == Pd::Workshop::COURSE_CSF

  facilitator.permission = UserPermission::FACILITATOR
  facilitator.save!
end

puts "#{course_facilitator_list.length} Course Facilitators Imported."
