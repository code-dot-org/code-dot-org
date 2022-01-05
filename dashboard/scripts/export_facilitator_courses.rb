#!/usr/bin/env ruby

# Exports a CSV listing all of our facilitators and the courses they have permissions to facilitate.
# To run, first create a file named facilitator_courses.csv in this directory - the output will be written to that file.
require_relative '../config/environment'

def facilitator_courses_csv
  puts "Exporting faciltator courses..."
  CSV.open("facilitator_courses.csv", "wb") do |csv|
    csv << ['Name', 'Username', 'Email', 'Course']
    Pd::SharedWorkshopConstants::ACTIVE_COURSES.each do |course|
      facilitators = Pd::CourseFacilitator.facilitators_for_course(course)
      facilitators.each do |facilitator|
        csv << [facilitator.name, facilitator.username, facilitator.email, course]
      end
    end
  end
  # error handling?
  puts "Done!"
end

def main
  facilitator_courses_csv
end

main
