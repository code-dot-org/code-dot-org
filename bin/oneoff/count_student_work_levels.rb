#!/usr/bin/env ruby

puts "loading rails env..."
start_time = Time.now
ENV['SKIP_I18N_INIT'] = '1'
require_relative '../../dashboard/config/environment'
puts "loaded rails env in #{(Time.now - start_time).to_i} seconds"

# rubocop:disable Style/WordArray
$collections = {
  CSF: [
    'coursea-2023',
    'courseb-2023',
    'coursec-2023',
    'coursed-2023',
    'coursee-2023',
    'coursef-2023',
    'express-2023',
    'pre-express-2023'
  ],
  CSC: [
    "counting-csc-2021",
    "explore-data-1-2021",
    "poetry-2021",
    "poetry-2023",
    "spelling-bee-2021",
    "csc-ecosystems-2023",
    "csc-timecapsule-2023",
    "csc-starquilts-2023",
    "csc-mappinglandmarks-2023",
    "csc-adaptations-2023",
    "csc-bookcovers-2023"
  ]
}
# rubocop:enable Style/WordArray

$courses = {
  CSD: 'csd-2023',
  CSP: 'csp-2023',
  CSA: 'csa-2023'
}

# include BubbleChoice and LevelGroup for now, since we are not counting their child levels
NON_WORK_LEVEL_TYPES = %w(External ExternalLink Unplugged StandaloneVideo CurriculumReference)

def student_work_level?(level)
  return false if NON_WORK_LEVEL_TYPES.include?(level.type)
  return false if level.properties['embed'] == 'true'
  return true
end

def main
  counts = {}

  counts.merge!(
    $collections.map do |curricula_name, unit_names|
      units = Unit.where(name: unit_names).all
      levels = units.map(&:levels).flatten
      count = levels.count {|l| student_work_level?(l)}
      [curricula_name, count]
    end.to_h
  )

  counts.merge!(
    $courses.map do |curricula_name, course_name|
      units = UnitGroup.find_by_name(course_name).units_for_user(nil)
      levels = units.map(&:levels).flatten
      count = levels.count {|l| student_work_level?(l)}
      [curricula_name, count]
    end.to_h
  )

  puts JSON.pretty_generate counts
end

main
