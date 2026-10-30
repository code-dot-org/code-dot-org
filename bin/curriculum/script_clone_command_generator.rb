#!/usr/bin/env ruby

# Generates the list of commands to clone each unit within an unit group
# This assumes that the new unit group is already created

require_relative '../../dashboard/config/environment'

def generate_unit_clone_commands(source_unit_group_name, src_year, dstn_year)
  destination_unit_group_name = source_unit_group_name.sub(src_year, dstn_year)

  puts "\nUnit group: [#{source_unit_group_name}] for destination year [#{dstn_year}]"
  puts "Create a destination unit group name with name [#{destination_unit_group_name}] at https://levelbuilder-studio.code.org/courses/new and run the commands below"

  UnitGroup.find_by_name(source_unit_group_name).default_units.each do |unit_to_clone|
    source_unit_name = unit_to_clone.name
    destination_unit_name = source_unit_name.sub(src_year, dstn_year)
    puts "Unit.find_by_name('#{source_unit_name}').clone_migrated_unit('#{destination_unit_name}', destination_unit_group_name: '#{destination_unit_group_name}', new_level_suffix: '#{dstn_year}')"
  end
end

puts "\nThis script does not generate correct commands for deep learning courses, courses that belong to a course family and those which aren't versioned."
puts "Pull latest from staging and run seeding to ensure the local curriculum state matches that of levelbuilder environment."
print "\nEnter the source year:"
source_year = gets.chomp

print "Enter the destination year:"
destination_year = gets.chomp

print "Enter a comma seperated list of scripts to clone:"
scripts_to_clone = gets.chomp

scripts_to_clone.split(",").reject(&:blank?).map(&:strip).each do |scpt_to_clone|
  clone_unit = Unit.find_by_name(scpt_to_clone)
  unless clone_unit.nil?
    puts "\Generating commands for unit: [#{scpt_to_clone}] for destination year [#{destination_year}]"
    dstn_unit_name = clone_unit.name.sub(source_year, destination_year)

    family_name = clone_unit.family_name
    if family_name.nil? || family_name.empty?
      puts "Clone commands for units that are not part of a family aren't supported yet. Please check the how-to guide and consider adding the support."
      next
    end

    puts "Unit.find_by_name('#{scpt_to_clone}').clone_migrated_unit('#{dstn_unit_name}', family_name: '#{family_name}', version_year: '#{destination_year}', new_level_suffix: '#{destination_year}')"
    next
  end

  clone_unit_group = UnitGroup.find_by_name(scpt_to_clone)
  unless clone_unit_group.nil?
    generate_unit_clone_commands(scpt_to_clone, '2023', '2024')
    next
  end

  puts "\nUnable to find either unit or unit group with name [#{scpt_to_clone}]"
end
