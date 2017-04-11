#!/usr/bin/env ruby
require_relative '../../../dashboard/config/environment'

ActiveRecord::Base.record_timestamps = false
Section.find_in_batches do |group|
  puts "Processing sections #{group.first.id} - #{group.last.id}"
  group.each do |section|
    first_activity_at = section.students.map do |student|
      user_scripts = student.user_scripts
      user_scripts = user_scripts.where(script_id: section.script_id) if section.script_id
      user_scripts.where('started_at > ?', section.created_at).minimum(:started_at)
    end.compact.min
    begin
      section.update!(first_activity_at: first_activity_at) if first_activity_at
    rescue
      puts "Failed to update section #{section.id}"
    end
  end
end
