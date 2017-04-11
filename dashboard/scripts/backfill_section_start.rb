#!/usr/bin/env ruby
require_relative '../config/environment'

Section.where(first_activity_at: nil).find_in_batches do |group|
  group.each do |section|
    first_activity_at = section.students.map {|student| student.user_scripts.minimum(:started_at)}.compact.min
    puts "Section #{section.id} started at #{first_activity_at}"
    section.update!(first_activity_at: first_activity_at) if first_activity_at
  end
end
