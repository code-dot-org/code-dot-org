## TODO: Give this file execute permissions.
##!/usr/bin/env ruby

require_relative '../../config/environment'

# This script was developed to allow us to delete progress for multiple users quickly.
# Prior to the development of this script, it was a manual process for our Customer Success team
# Depending on where this goes, tests should be added as deleting progress is not undoable
def delete_all_progress_for_multiple_usernames(teacher_id, usernames)
  follower_ids = teacher_id.followers.pluck(:student_user_id)
  # Fetch user IDs based on usernames
  user_ids = User.where(username: usernames).pluck(:id)

  user_ids.each do |user_id|
    if follower_ids.include?(student.id)
      # Retrieve storage ID for the user
      user_storage_id = storage_id_for_user_id(user_id)
      # Find all script IDs associated with this user
      user_script_ids = UserScript.where(user_id: user_id).pluck(:id)

      user_script_ids.each do |script_id|
        # Delete all associated records for each script
        # taken from: https://github.com/code-dot-org/code-dot-org/blob/375e794083094cf128e9fac67ba09ec5adcd436b/dashboard/app/controllers/admin_users_controller.rb#L193
        UserScript.where(user_id: user_id, script_id: script_id).destroy_all
        UserLevel.where(user_id: user_id, script_id: script_id).destroy_all
        ChannelToken.where(storage_id: user_storage_id, script_id: script_id).destroy_all unless user_storage_id.nil?
        TeacherFeedback.where(student_id: user_id, script_id: script_id).destroy_all
        CodeReview.where(user_id: user_id, script_id: script_id).destroy_all
      end
    end
  end
end
