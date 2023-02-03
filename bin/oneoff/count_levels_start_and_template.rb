#!/usr/bin/env ruby

# Script to count levels with both start blocks and a template. Used to help determine if it's feasible to disable
# editing of start blocks if the level had a template. We had many offending levels so it was not feasible.
require_relative '../../dashboard/config/environment'
require 'set'

count = 0
scripts = Set[]

Level.all.each do |level|
  next unless level.project_template_level && level.respond_to?(:start_blocks) && level.start_blocks
  count += 1
  scripts_belonged_to = level.script_levels
  scripts_belonged_to.each do |script_level|
    scripts.add(script_level.script.name)
  end
  puts "Found invalid level: #{level.name}"
end

puts "scripts with invalid levels"
scripts.each do |script|
  puts script
end

puts "Found #{count} levels and #{scripts.length} scripts with both start sources/blocks and a project template level name"
