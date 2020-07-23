#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_level_id based on user assignment.

require_relative '../../../dashboard/config/environment'

def feedbacks_without_script_level_id
  TeacherFeedback.where(script_level_id: nil)
end

def puts_count
  puts "There are #{feedbacks_without_script_level_id.count} feedbacks without a script_level_id"
end

def update_script_level_ids_based_on_assignment
  puts "backfilling script_level_ids based on assignment"
  feedbacks_without_script_level_id.find_each do |feedback|
    puts "*"
    associated_script_levels = feedback.level.script_levels
    if associated_script_levels.length > 1
      associated_user_levels = UserLevel.where(
        user_id: feedback.student_id,
        level_id: feedback.level_id
      )
      if associated_user_levels != 1
        student_sections_taught_by_feedback_giver =
          student_sections.select {|section| section.teacher == feedback.teacher}

        # All scripts assigned by the teacher that gave the feedback
        scripts_assigned_by_feedback_giver =
          student_sections_taught_by_feedback_giver.map(&:script).compact

        # The associated script levels in any of the scripts assigned by the feedback giver
        candidate_script_levels = associated_script_levels.where(
          script: scripts_assigned_by_feedback_giver
        )

        # If there's only one of those, use it!
        if candidate_script_levels.length == 1
          feedback.update_attributes(script_level: candidate_script_levels.first)
        end
      end
    end
  end
  puts "finished backfilling script_level_ids based on assignment!"
end

TeacherFeedback.transaction do
  puts_count
  update_script_level_ids_based_on_assignment
  puts_count
end
