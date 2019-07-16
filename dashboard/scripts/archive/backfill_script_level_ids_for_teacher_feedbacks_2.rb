#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_level_id based on user progress.

require_relative '../../config/environment'

def feedbacks_without_script_level_id
  TeacherFeedback.where(script_level_id: nil)
end

def puts_count
  puts "There are #{feedbacks_without_script_level_id.count} feedbacks without a script_level_id"
end

def update_script_level_ids
  puts "backfilling script_level_ids..."
  feedbacks_without_script_level_id.find_each do |feedback|
    associated_script_levels = feedback.level.script_levels
    if associated_script_levels.length > 1
      associated_user_levels = UserLevel.where(
        user_id: feedback.student_id,
        level_id: feedback.level_id
      )
      if associated_user_levels.length == 1
        script_levels = ScriptLevel.where(
          level_id: associated_user_levels[0].level_id,
          script_id: associated_user_levels[0].script_id
        )
        if script_levels.length == 1
          script_level_id = script_levels[0].id
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
