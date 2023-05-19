#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_level_id based on user progress.

require_relative '../../../dashboard/config/environment'

def feedbacks_without_script_level_id
  TeacherFeedback.where(script_level_id: nil)
end

def puts_count
  puts "There are #{feedbacks_without_script_level_id.count} feedbacks without a script_level_id"
end

def update_script_level_ids
  puts "backfilling script_level_ids..."
  feedbacks_without_script_level_id.find_each do |feedback|
    puts "*"
    feedback_script_levels = feedback.level.script_levels
    if feedback_script_levels.length > 1
      associated_user_levels = UserLevel.where(
        user_id: feedback.student_id,
        level_id: feedback.level_id
      )
      if associated_user_levels.length == 1
        progress_script_levels = associated_user_levels.first.script_levels
        candidate_script_levels = feedback_script_levels & progress_script_levels
        if candidate_script_levels.length == 1
          script_level_id = candidate_script_levels.first.id
          feedback.update_attributes(script_level_id: script_level_id)
        end
      end
    end
  end
end

TeacherFeedback.transaction do
  puts_count
  update_script_level_ids
  puts_count
end
