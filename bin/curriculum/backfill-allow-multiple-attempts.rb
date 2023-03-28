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
  level.levels_parent_levels.count {|l| l.kind == 'contained'} > 0
end

def find_union(standalone_levels, contained_levels)
  standalone_level_names = standalone_levels.map(&:name)
  contained_levels.filter {|l| standalone_level_names.include?(l.name)}.uniq
end

def backfill_free_response_levels
  standalone_free_response_levels = FreeResponse.all.filter {|l| level_is_standalone?(l)}
  contained_free_response_levels = FreeResponse.all.filter {|l| level_is_contained?(l)}
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

def backfill_match_levels
  standalone_match_levels = Match.all.filter {|l| level_is_standalone?(l)}
  contained_match_levels = Match.all.filter {|l| level_is_contained?(l)}
  match_levels_to_flag = find_union(standalone_match_levels, contained_match_levels)
  contained_match_levels -= match_levels_to_flag
  puts "Match levels to manually check:"
  match_levels_to_flag.each {|l| puts l.name}

  contained_match_levels.each do |level|
    level.allow_multiple_attempts = "false"
    level.save!
  end

  Match.all.filter {|l| l.allow_multiple_attempts.nil?}.each do |level|
    level.allow_multiple_attempts = "true"
    level.save!
  end
end

def main
  backfill_free_response_levels
  backfill_match_levels
end

main
