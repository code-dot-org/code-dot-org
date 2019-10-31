#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_level_id based on script
# stability. Scripts have is_stable set to true when we launch curriculum.
# Scripts that do not have is_stable set to true are used internally, usually
# as drafts.

require_relative '../../../dashboard/config/environment'

def feedbacks_without_script_level_id
  TeacherFeedback.where(script_level_id: nil)
end

def puts_count
  puts "There are #{feedbacks_without_script_level_id.count} feedbacks without a script_level_id"
end

def update_script_level_ids_based_on_script_stability
  puts "backfilling script_level_ids based on script stability"
  feedbacks_without_script_level_id.find_each do |feedback|
    puts "*"
    associated_script_levels = feedback.level.script_levels
    if associated_script_levels.length > 1
      script_levels_with_stable_scripts = associated_script_levels.select {|sl| sl.script.is_stable}
      if script_levels_with_stable_scripts.length == 1
        feedback.update_attributes(script_level_id: script_levels_with_stable_scripts.first.id)
      end
    end
  end
  puts "finished backfilling script_level_ids based on script stability!"
end

TeacherFeedback.transaction do
  puts_count
  update_script_level_ids_based_on_script_stability
  puts_count
end
