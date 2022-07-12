#!/usr/bin/env ruby

# Exports a CSV listing facilitators for all of our active courses
# Results will be written to course_facilitators.csv (in the directory where you run the script)
# Don't forget to clean up the CSV file when you are done with it!
require_relative '../config/environment'

def course_facilitators_csv
  puts "Exporting course facilitators..."
  CSV.open("course_facilitators.csv", "wb") do |csv|
    csv << ['Name', 'Username', 'Email', 'Course']
    Pd::SharedWorkshopConstants::ACTIVE_COURSES.each do |course|
      puts "Getting facilitators for #{course}..."
      facilitators = Pd::CourseFacilitator.facilitators_for_course(course)
      facilitators.each do |facilitator|
        csv << [facilitator.name, facilitator.username, facilitator.email, course]
      end
    end
    csv
  end
  puts "Finished! Remember to delete course_facilitators.csv when you are done."
end

def main
  course_facilitators_csv
end

main
