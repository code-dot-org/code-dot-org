#!/usr/bin/env ruby

require_relative '../../deployment'
raise unless [:development, :adhoc, :levelbuilder].include? rack_env

# Wait until after initial error checking before loading the rails environment.
def require_rails_env
  puts "loading rails environment..."
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  puts "rails environment loaded in #{(Time.now - start_time).to_i} seconds."
end

require_rails_env

def level_is_standalone?(level)
  level.script_levels.count > 0
end

def level_is_contained?(level)
  ParentLevelsChildLevel.where(child_level_id: level.id).where(kind: 'contained').count > 0
end

def find_union(standalone_levels, contained_levels)
  standalone_level_names = standalone_levels.map(&:name)
  contained_levels.filter {|l| standalone_level_names.include?(l.name)}.uniq
end

def backfill_free_response_levels
  standalone_free_response_levels = FreeResponse.all.filter {|l| level_is_standalone?(l) && l.allow_multiple_attempts.nil?}
  contained_free_response_levels = FreeResponse.all.filter {|l| level_is_contained?(l) && l.allow_multiple_attempts.nil?}
  free_response_levels_to_flag = find_union(standalone_free_response_levels, contained_free_response_levels)
  contained_free_response_levels -= free_response_levels_to_flag
  puts "Free Response levels to manually check:"
  free_response_levels_to_flag.each {|l| puts l.name}

  contained_free_response_levels.each do |level|
    level.allow_multiple_attempts = "false"
    level.save!
  end

  FreeResponse.all.filter {|l| l.allow_multiple_attempts.nil?}.each do |level|
    level.allow_multiple_attempts = "true"
    level.save!
  end
end

# Add `allow_multiple_attempts true/false` to the DSL text for the level
# Then call assign_attributes to update the level and rewrite the file
# This method catches exceptions as not all errors are immediately addressable
def update_dsl_level(level, allow_multiple_attempts)
  allow_multiple_attempts_str = allow_multiple_attempts.to_s
  path = level.file_path
  file_contents = File.read(path)
  text = level.class.decrypt_dsl_text_if_necessary(file_contents)
  encrypted = file_contents =~ /^encrypted '(.*)'$/m
  if text.include?('allow_multiple_attempts')
    return if text.include?("allow_multiple_attempts #{allow_multiple_attempts_str}")
    text.gsub!(/allow_multiple_attempts.*$/, "allow_multiple_attempts #{allow_multiple_attempts_str}")
  else
    text += "\nallow_multiple_attempts #{allow_multiple_attempts_str}"
  end
  level.assign_attributes({dsl_text: text, allow_multiple_attempts: allow_multiple_attempts_str, encrypted: encrypted})
  level.save!
  raise "allow_multiple_attempts unset for #{level.name}" if level.reload.allow_multiple_attempts.nil?
rescue => exception
  puts "Error updating #{level.name} with error #{exception.inspect}"
end

def backfill_match_levels
  standalone_match_levels = Multi.all.filter {|l| level_is_standalone?(l) && l.allow_multiple_attempts.nil?}
  contained_match_levels = Multi.all.filter {|l| level_is_contained?(l) && l.allow_multiple_attempts.nil?}
  match_levels_to_flag = find_union(standalone_match_levels, contained_match_levels)
  contained_match_levels -= match_levels_to_flag
  puts "Match levels to manually check:"
  match_levels_to_flag.each {|l| puts l.name}

  contained_match_levels.each do |level|
    update_dsl_level(level, false)
  end

  contained_level_names = contained_match_levels.map(&:name)
  Match.all.filter {|l| l.allow_multiple_attempts.nil? && !contained_level_names.include?(l.name)}.each do |level|
    update_dsl_level(level, true)
  end
end

def main
  # backfill_free_response_levels
  backfill_match_levels
end

main
