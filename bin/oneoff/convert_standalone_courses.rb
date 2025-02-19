#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# This script is used to convert standalone courses to UnitGroups.

def convert_standalone_course(unit_name)
  # Find all standalone courses
  existing_unit  = Unit.find_by_name(unit_name)
  new_unit_group = UnitGroup.new(
    name: existing_unit.name,
    family_name: existing_unit.family_name,
    version_year: existing_unit.version_year,
    instruction_type: existing_unit.instruction_type,
    instructor_audience: existing_unit.instructor_audience,
    participant_audience: existing_unit.participant_audience,
    has_numbered_units: true
  )
  unless new_unit_group.save
    puts "Conversion failed for #{unit_name}: #{new_unit_group.errors.full_messages.join(', ')}"
    return false
  end

  # puts "Initial info"
  # puts "Existing unit: #{existing_unit.inspect}"
  # puts
  if existing_unit.course_version.nil?
    puts "Existing Unit's course version not found: #{unit_name}"
    return
  end

  # Point existing CourseVersion to the new UnitGroup
  course_version = existing_unit.course_version
  original_course_version_id = course_version.id
  # puts "Existing course_version: #{existing_unit.course_version.inspect}"
  course_version.update!(content_root: new_unit_group)

  # Clear "course" settings from the unit
  dupe_unit = existing_unit.dup
  published_state = existing_unit.published_state
  existing_unit.update!(is_course: false, version_year: nil, family_name: nil, published_state: nil, instruction_type: nil, instructor_audience: nil, participant_audience: nil)

  # Add existing unit to new unit group
  new_unit_group.update_scripts([existing_unit.name])

  # Publish the new unit group
  new_unit_group.update!(published_state: published_state)

  run_checks(new_unit_group, existing_unit, course_version, dupe_unit, original_course_version_id)
end

def run_checks(new_unit_group, existing_unit, course_version, dupe_unit, original_course_version_id)
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
    puts "Failing Unit: #{dupe_unit.name}"
    failing_checks = checks.select {|_, result| !result}
    failing_checks.each {|description, result| puts "#{description}: #{result}"}
  end

  # puts "View the new unitgroup here: http://localhost-studio.code.org:3000/courses/#{new_unit_group.name}"
  all_passed
end

def convert_standalone_courses
  # Temporarily remove readonly attributes
  # original_readonly = CourseVersion.readonly_attributes
  # CourseVersion.readonly_attributes = []

  # Skip some checks in UnitGroup.update_scripts
  Rails.configuration.converting_standalone_courses = true

  # Find all standalone courses
  init_standalone_courses = Unit.all.filter(&:is_course?)
  init_count = init_standalone_courses.count
  init_standalone_courses.each do |standalone_unit|
    convert_standalone_course(standalone_unit.name)
  end

  puts "Units Converted: #{init_count - Unit.all.count(&:is_course?)}"

  # Restore readonly attributes to their original values
  # CourseVersion.readonly_attributes = original_readonly
  Rails.configuration.converting_standalone_courses = false
end

def main
  convert_standalone_courses
end
