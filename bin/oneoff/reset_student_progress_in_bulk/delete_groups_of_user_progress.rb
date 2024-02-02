#!/usr/bin/env ruby

require_relative '../config/environment'
require 'csv'

# This script was developed to allow us to delete progress for multiple users quickly.
# Prior to the development of this script, it was a manual process for our Customer Success team
# Depending on where this goes, tests should be added as deleting progress is not undoable

if ARGV.empty? || ARGV.length > 2
  puts 'Usage: ./bin/oneoff/reset_student_progress_in_bulk ./bin/oneoff/reset_student_progress_in_bulk/yyyy-mm-dd-users.csv [commit]'
  puts 'The CSV needs a column with "user_names".'
  puts 'Will do a "dry run" until you specify "for-real" for the "commit" field.'
  exit 1
end

csv_file_path = 'path/to/your/usernames.csv'

# When run, replace the teacher_id and usernames list below
teacher_id = 547
usernames = CSV.read(csv_file_path, headers: true).map {|row| row['username']}

# usernames = ["crazy_kate", "coder_mark197", "stacy", "studentkt"]

teacher_user = User.find_by(id: teacher_id)

# Get user IDs of all students in the teacher_user's sections
follower_ids = teacher_user.followers.pluck(:student_user_id)

# Get user IDs based on usernames
user_ids = User.where(username: usernames).pluck(:id)

# Delete all progress
user_ids.each do |user_id|
  next unless follower_ids.include?(user_id)
  # Retrieve storage ID for the user
  user_storage_id = storage_id_for_user_id(user_id)
  # inspired from: https://github.com/code-dot-org/code-dot-org/blob/375e794083094cf128e9fac67ba09ec5adcd436b/dashboard/app/controllers/admin_users_controller.rb#L193
  UserScript.where(user_id: user_id).destroy_all
  UserLevel.where(user_id: user_id).destroy_all
  ChannelToken.where(storage_id: user_storage_id).destroy_all unless user_storage_id.nil?
  TeacherFeedback.where(student_id: user_id).destroy_all
  CodeReview.where(user_id: user_id).destroy_all
end
