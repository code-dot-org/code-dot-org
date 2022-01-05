#!/usr/bin/env ruby

# Exports a CSV listing facilitators for all of our active courses
# Results will be written to facilitator_courses.csv (in the directory where you run the script)
require_relative '../config/environment'

def facilitator_courses_csv
  puts "Exporting faciltator courses..."
  CSV.open("facilitator_courses.csv", "wb") do |csv|
    csv << ['Name', 'Username', 'Email', 'Course']
    Pd::SharedWorkshopConstants::ACTIVE_COURSES.each do |course|
      puts "Getting facilitators for #{course}..."
      facilitators = Pd::CourseFacilitator.facilitators_for_course(course)
      facilitators.each do |facilitator|
        csv << [facilitator.name, facilitator.username, facilitator.email, course]
      end
    end
  end
  puts "Done!"
end

def main
  facilitator_courses_csv
end

main
