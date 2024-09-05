#!/usr/bin/env ruby

# This script was developed to allow us to delete progress for multiple users quickly.
# Prior to the development of this script, it was a manual process for our Customer Success team
# Depending on where this goes, tests should be added as deleting progress is not undoable

if ARGV.empty? || ARGV.length > 3
  puts "Usage: #{__FILE__} teacher_id_or_email #{File.dirname(__FILE__)}/yyyy-mm-dd-user-ids.csv [commit]"
  puts 'The CSV needs columns with "student_id" and "unit_name".'
  puts 'Will do a "dry run" until you specify "for-real" for the "commit" field.'
  exit 1
end

require_relative '../../../dashboard/config/environment'
require 'csv'

csv_file_path = ARGV[1]

teacher_id = ARGV[0]
teacher_user = nil
if teacher_id.include?('@')
  teacher_user = User.find_by_email(teacher_id)
elsif teacher_id.to_i.to_s == teacher_id
  teacher_user = User.find_by_id(teacher_id)
else
  raise "teacher id must be an id or email: #{teacher_id.inspect}"
end
raise "Teacher with id or email " + teacher_id.to_s.dump + " not found" if teacher_user.nil?

rows = CSV.read(csv_file_path, headers: true)
rows.each do |row|
  unless row['student_id']
    puts 'CSV must have a column named "student_id".'
    exit 1
  end
  unless row['unit_name']
    puts 'CSV must have a column named "unit_name".'
    exit 1
  end

  unit_name = row['unit_name']
  unit = Unit.find_by_name(unit_name)
  raise "Unit with name #{unit_name} not found" unless unit
  row['script_id'] = unit.id
end

puts "Found #{rows.count} ids to reset data for."

do_dry_run = true
if ARGV[2] == "for-real"
  do_dry_run = false
end

# Get user IDs of all students in the teacher_user's sections
follower_ids = teacher_user.followers.pluck(:student_user_id)

# Delete progress
rows.each do |row|
  student_id = row['student_id'].to_i
  script_id = row['script_id']
  raise "missing script_id for row #{row}" unless script_id
  if follower_ids.include?(student_id)
    if do_dry_run
      puts "can remove student data with id " + student_id.to_s
    else
      User.delete_progress_for_unit(user_id: student_id, script_id: script_id)
    end
  else
    puts "Student with id " + student_id.to_s + " is not in teacher " + teacher_id.to_s +
      " section"
  end
end
