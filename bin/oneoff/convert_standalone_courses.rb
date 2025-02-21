#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'fileutils'

# This script is used to convert standalone courses to UnitGroups.

def convert_standalone_course(existing_unit, verbose = false, check = true)
  # Find existing Unit and create new UnitGroup
  new_unit_group = UnitGroup.new(
    name: existing_unit.name,
    family_name: existing_unit.family_name,
    version_year: existing_unit.version_year,
    instruction_type: existing_unit.instruction_type,
    instructor_audience: existing_unit.instructor_audience,
    participant_audience: existing_unit.participant_audience,
    has_numbered_units: false
  )
  unless new_unit_group.save
    puts "Conversion failed for #{existing_unit.name}: #{new_unit_group.errors.full_messages.join(', ')}"
    return false
  end

  # Get existing Unit's course version
  course_version = existing_unit.course_version
  if course_version.nil?
    puts "Existing Unit's course version not found: #{existing_unit.name}"
    return
  end
  original_course_version_id = course_version.id

  if verbose
    puts "Initial info"
    puts "Existing unit: #{existing_unit.inspect}"
    puts "Existing course_version: #{existing_unit.course_version.inspect}"
  end

  # Point existing CourseVersion to the new UnitGroup
  course_version.update!(content_root: new_unit_group)

  i18n_params = {
    "title" => existing_unit.localized_title || '',
    "description_short" => existing_unit.summarize_i18n_for_edit[:descriptionShort] || '',
    "description_student" => existing_unit.localized_student_description || '',
    "description_teacher" => existing_unit.localized_description || '',
    "version_title" => existing_unit.version_year || ''
  }

  # Clear "course" settings from the unit
  unit_copy = existing_unit.dup
  existing_unit.update!(is_course: false, version_year: nil, family_name: nil, published_state: nil, instruction_type: nil, instructor_audience: nil, participant_audience: nil)

  # Add existing unit to new unit group and update strings
  Dir.chdir(Rails.root) do
    new_unit_group.persist_strings_and_units_changes([existing_unit.name], i18n_params)
  end

  # Publish the new unit group
  new_unit_group.update!(published_state: unit_copy.published_state)

  run_checks(new_unit_group, existing_unit, course_version, unit_copy, original_course_version_id, verbose) if check
end

def run_checks(new_unit_group, existing_unit, course_version, dupe_unit, original_course_version_id, verbose)
  checks = {
    "New UnitGroup is valid" => new_unit_group.valid?,
    "Existing unit is valid" => existing_unit.valid?,
    "CourseVersion is valid" => course_version.valid?,
    "New UnitGroup has the same name as the existing unit" => new_unit_group.name == dupe_unit.name,
    "New UnitGroup has the same family_name as the existing unit" => new_unit_group.family_name == dupe_unit.family_name,
    "New UnitGroup has the same version_year as the existing unit" => new_unit_group.version_year == dupe_unit.version_year,
    "New UnitGroup has the same instruction_type as the existing unit" => new_unit_group.instruction_type == dupe_unit.instruction_type,
    "New UnitGroup has the same instructor_audience as the existing unit" => new_unit_group.instructor_audience == dupe_unit.instructor_audience,
    "New UnitGroup has the same participant_audience as the existing unit" => new_unit_group.participant_audience == dupe_unit.participant_audience,
    "New UnitGroup has the same published_state as the existing unit" => new_unit_group.published_state == dupe_unit.published_state,
    "New UnitGroup is assigned to the existing unit" => new_unit_group.default_units.first.id == existing_unit.id,
    "New UnitGroup is a single unit course" => new_unit_group.single_unit_course?,
    "New UnitGroup has the same course_version as the existing unit" => new_unit_group.course_version.id == original_course_version_id,
    "CourseVersion has a content_root_type of 'UnitGroup'" => course_version.content_root_type == 'UnitGroup',
    "CourseVersion has a content_root of the new UnitGroup" => course_version.content_root_id == new_unit_group.id
  }

  # Determine if all checks passed
  all_passed = checks.values.all?
  unless all_passed
    puts "Incorrect Unit: #{dupe_unit.name}"
    failing_checks = checks.select {|_, result| !result}
    failing_checks.each {|description, result| puts "#{description}: #{result}"}
  end

  puts "View the new UnitGroup here: http://localhost-studio.code.org:3000/courses/#{new_unit_group.name}" if verbose
  all_passed
end

def main
  # Temporarily remove readonly attributes
  # original_readonly = CourseVersion.readonly_attributes
  # CourseVersion.readonly_attributes = []

  # Skip some checks in UnitGroup.update_scripts
  Rails.configuration.converting_standalone_courses = true

  # Find all standalone courses
  init_standalone_courses = Unit.all.filter(&:is_course?)
  init_count = init_standalone_courses.count
  init_standalone_courses.each do |standalone_unit|
    convert_standalone_course(standalone_unit)
  end

  puts "Units Converted: #{init_count - Unit.all.count(&:is_course?)}"

  # Restore readonly attributes to their original values
  # CourseVersion.readonly_attributes = original_readonly
  Rails.configuration.converting_standalone_courses = false
end

main if __FILE__ == $0
