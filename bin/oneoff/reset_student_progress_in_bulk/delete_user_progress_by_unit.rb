#!/usr/bin/env ruby

# This script was developed to allow us to delete progress for multiple users quickly.
# Prior to the development of this script, it was a manual process for our Customer Success team
# Depending on where this goes, tests should be added as deleting progress is not undoable

if ARGV.empty? || ARGV.length > 3
  puts 'Usage: ./bin/oneoff/reset_student_progress_in_bulk teacher_id_or_email ./bin/oneoff/reset_student_progress_in_bulk/yyyy-mm-dd-user-ids.csv [commit]'
  puts 'The CSV needs columns with "student_id" and "unit_name".'
  puts 'Will do a "dry run" until you specify "for-real" for the "commit" field.'
  exit 1
end

require_relative '../../../dashboard/config/environment'
require 'csv'

csv_file_path = ARGV[1]

teacher_id = ARGV[0]
teacher_user = User.find_by(id: teacher_id) || User.find_by(email: teacher_id)
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
      # Retrieve storage ID for the user
      user_storage_id = storage_id_for_user_id(student_id)
      # inspired from: https://github.com/code-dot-org/code-dot-org/blob/375e794083094cf128e9fac67ba09ec5adcd436b/dashboard/app/controllers/admin_users_controller.rb#L193
      UserScript.where(user_id: student_id, script_id: script_id).destroy_all
      UserLevel.where(user_id: student_id, script_id: script_id).destroy_all
      ChannelToken.where(storage_id: user_storage_id, script_id: script_id).destroy_all unless user_storage_id.nil?
      TeacherFeedback.where(student_id: student_id, script_id: script_id).destroy_all
      CodeReview.where(user_id: student_id, script_id: script_id).destroy_all
    end
  else
    puts "Student with id " + student_id.to_s + " is not in teacher " + teacher_id.to_s +
      " section"
  end
end
