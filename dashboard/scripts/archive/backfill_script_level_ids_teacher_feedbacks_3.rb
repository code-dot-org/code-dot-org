#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_level_id based on user assignment.

require_relative '../../config/environment'

def feedbacks_without_script_level_id
  TeacherFeedback.where(script_level_id: nil)
end

def puts_count
  puts "There are #{feedbacks_without_script_level_id.count} feedbacks without a script_level_id"
end

def update_script_level_ids_based_on_assignment
  puts_count
  puts "backfilling script_level_ids based on assignment"
  feedbacks_without_script_level_id.find_each do |feedback|
    associated_script_levels = feedback.level.script_levels
    if associated_script_levels.length > 1
      associated_user_levels = UserLevel.where(
        user_id: feedback.student_id,
        level_id: feedback.level_id
      )
      if associated_user_levels != 1
        student_sections = feedback.student.sections_as_student
        if student_sections.length = 1 && student_sections[0].script_id
          script_level_id = ScriptLevel.where(
            level_id: feedback.level_id,
            script_id: student_sections[0].script_id
          ).id
          feedback.update_attributes(script_level_id: script_level_id)
        elsif student_sections.length > 1
          student_sections_taught_by_feedback_giver = student_sections.select {|section| section.user_id == feedback.teacher_id}
          if student_sections_taught_by_feedback_giver.length = 1 && student_sections_taught_by_feedback_giver[0].script_id
            script_level_id = ScriptLevel.where(
              level_id: feedback.level_id,
              script_id: student_sections_taught_by_feedback_giver[0].script_id
            ).id
            feedback.update_attributes(script_level_id: script_level_id)
          end
        end
      end
    end
  end
  puts "finished backfilling script_level_ids based on assignment!"
  puts_count
end

TeacherFeedback.transaction do
  update_script_level_ids_based_on_assignment
end
