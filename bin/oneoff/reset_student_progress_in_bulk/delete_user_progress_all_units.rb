#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'
require 'csv'

# This script was developed to allow us to delete progress for multiple users quickly.
# Prior to the development of this script, it was a manual process for our Customer Success team
# Depending on where this goes, tests should be added as deleting progress is not undoable

if ARGV.empty? || ARGV.length > 3
  puts "Usage: #{__FILE__} teacher_id ./bin/oneoff/reset_student_progress_in_bulk/yyyy-mm-dd-users.csv [commit]"
  puts 'The CSV needs a column with "student_id".'
  puts 'Will do a "dry run" until you specify "for-real" for the "commit" field.'
  exit 1
end

csv_file_path = ARGV[1]

teacher_id = ARGV[0]
teacher_user = User.find_by(id: teacher_id)

student_ids = CSV.read(csv_file_path, headers: true).map {|row| row['student_id'].to_i}

puts "Found #{student_ids.count} ids to reset data for."

do_dry_run = true
if ARGV[2] == "for-real"
  do_dry_run = false
end

# Get user IDs of all students in the teacher_user's sections
follower_ids = teacher_user.followers.pluck(:student_user_id)

# Delete all progress
student_ids.each do |student_id|
  if follower_ids.include?(student_id)
    if do_dry_run
      puts "can remove student data with id " + student_id.to_s
    else
      # Retrieve storage ID for the user
      user_storage_id = storage_id_for_user_id(student_id)
      # inspired from: https://github.com/code-dot-org/code-dot-org/blob/375e794083094cf128e9fac67ba09ec5adcd436b/dashboard/app/controllers/admin_users_controller.rb#L193
      UserScript.where(user_id: student_id).destroy_all
      UserLevel.where(user_id: student_id).destroy_all
      ChannelToken.where(storage_id: user_storage_id).destroy_all unless user_storage_id.nil?
      TeacherFeedback.where(student_id: student_id).destroy_all
      CodeReview.where(user_id: student_id).destroy_all
    end
  else
    puts "Student with id " + student_id.to_s + " is not in teacher " + teacher_id.to_s +
      " section"
  end
end
