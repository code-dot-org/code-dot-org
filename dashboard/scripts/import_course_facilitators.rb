#!/usr/bin/env ruby
require_relative '../config/environment'
require 'csv'

COL_FIRST_NAME = 'First'
COL_LAST_NAME = 'Last'
COL_USER_ID = 'Code Studio ID'
COL_EMAIL = 'Email Address'
COL_COURSE = 'Program'

facilitators_csv = ARGV[0]
unless facilitators_csv
  puts 'Usage: import_course_facilitators facilitators.csv'
  exit
end

class CSV::Row
  def [](header)
    raw_value = self.field header
    return nil unless raw_value
    raw_value.strip
  end
end

# First pass, validate the data.
course_facilitator_params_list = []
CSV.foreach(facilitators_csv, headers: true) do |row|
  user_id = row[COL_USER_ID]
  first_name = row[COL_FIRST_NAME]
  last_name = row[COL_LAST_NAME]
  email = row[COL_EMAIL]
  course = row[COL_COURSE]

  next unless email
  next unless first_name || last_name

  raise "Unrecognized course #{course}" unless Pd::Workshop::COURSES.include? course

  facilitator =
    if user_id.nil?
      User.find_by!(email: email)
    else
      User.find_by!(id: user_id)
    end

  # validate other fields
  unless facilitator.name == "#{first_name} #{last_name}" && facilitator.email.casecmp(email)
    raise "Facilitator #{user_id} does not match name or email."
  end

  course_facilitator_params_list << {facilitator_id: facilitator.id, course: course}
end

# Second pass, import the data.
course_facilitator_params_list.each do |course_facilitator_params|
  Pd::CourseFacilitator.find_or_create_by course_facilitator_params
end

puts 'Success.'
