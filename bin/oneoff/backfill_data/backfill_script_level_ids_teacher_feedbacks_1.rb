#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_level_id if it can easily be # inferred because there is only one ScriptLevel associated with the level_id

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
    associated_script_levels = feedback.level.script_levels
    if associated_script_levels.length == 1
      script_level_id = associated_script_levels[0].id
      feedback.update_attributes(script_level_id: script_level_id)
    end
  end
end

TeacherFeedback.transaction do
  puts_count
  update_script_level_ids
  puts_count
end
