#!/usr/bin/env ruby

# Move a unit and its courses and course offerings into the ui-test curriculum
# data partition. For background, see dashboard/test/ui/config/README.md

# The strategy is to give each Unit, UnitGroup and CourseOffering object name
# the "ui-test-" prefix in the database, then use existing serialization logic
# to write the objects to disk. That logic already detects the ui-test- prefix
# and writes those objects into the dashboard/test/ui/config tree. This script
# then deletes the files left at the old paths. Levels are not touched here;
# run clone_ui_test_levels.rb on the renamed unit afterward.
#
# For each course rename, the course's family_name and its CourseOffering key
# are renamed with it. Offering display names and i18n titles that just echoed
# the old slug are re-pointed at the new slug; anything hand-written is kept as
# is. Titles that read as prose are left to be edited by hand.
#
# The i18n entries under config/locales/{scripts,courses}/en.yml are renamed to
# the new key in place.
#
# The preflight method resolves and checks every object before anything is
# renamed, the renames run in a transaction, and the files left at the old paths
# are deleted only after their replacements have been written, so a bad argument
# stops the run instead of leaving a half-renamed database or deleted
# production curriculum files.
#
# The renamed unit is also given fresh seeding keys for the three objects
# whose keys are unique across their whole table rather than scoped to a
# script, so that it can coexist with the unit it was renamed from.
#
# Must run with levelbuilder_mode on. Commit the result. Like
# clone_ui_test_levels.rb, this exists for the repartitioning effort and gets
# deleted once the partition is in place.
#
# Usage:
#   bin/curriculum/migrate_unit_to_ui_test.rb \
#     --unit allthettsthings:ui-test-tts \
#     --course allthettsthings:ui-test-tts \
#     --course original-allthettsthings-course:ui-test-original-tts

require 'optparse'
require 'securerandom'

SLUG_ECHO_KEYS = %w(name title).freeze

CourseRename = Struct.new(:old_name, :new_name, :unit_group, :offering)

def parse_options
  options = {courses: []}

  OptionParser.new do |opts|
    opts.banner = "Usage: migrate_unit_to_ui_test.rb --unit Old:New [--course Old:New ...]"

    opts.on("-u", "--unit OldName:NewName", "Unit to rename") do |pair|
      options[:unit] = parse_pair(pair)
    end

    opts.on("-c", "--course OldName:NewName", "Course (UnitGroup) to rename; repeatable") do |pair|
      options[:courses] << parse_pair(pair)
    end

    opts.on("-h", "--help", "Prints this help") do
      puts opts
      exit
    end
  end.parse!

  raise "--unit is required. Use -h for options." unless options[:unit]
  options
end

def parse_pair(pair)
  old_name, new_name = pair.split(':', 2)
  raise "expected Old:New, got #{pair.dump}" if old_name.nil? || new_name.nil? || new_name.empty?
  raise "#{new_name.dump} must start with 'ui-test-'" unless new_name.start_with?('ui-test-')
  [old_name, new_name]
end

def require_rails_env
  require_relative '../../dashboard/config/environment'
end

def delete_file(path)
  return unless File.exist?(path)
  File.delete(path)
  puts "deleted #{path}"
end

# Resolve everything the run will touch, and refuse the run if anything is
# missing or out of scope. Mutates nothing.
def preflight(options)
  old_unit_name = options[:unit].first
  unit = Unit.find_by(name: old_unit_name)
  raise "Unit not found: #{old_unit_name}" if unit.nil?

  course_renames = options[:courses].map do |old_name, new_name|
    unit_group = UnitGroup.find_by_name(old_name)
    raise "Course not found: #{old_name}" if unit_group.nil?
    CourseRename.new(old_name, new_name, unit_group, offering_to_rename(unit_group, old_name))
  end

  # A course that is left behind still lists the unit under its old name, and
  # both UnitGroup#update_scripts and #update_original_scripts resolve those
  # names with Unit.find_by_name!, so the next seed of that course would raise
  # rather than warn.
  listing_courses = (unit.unit_groups.to_a + [unit.original_unit_group]).compact.map(&:name).uniq
  unpassed = listing_courses - course_renames.map(&:old_name)
  if unpassed.any?
    raise "#{unpassed.join(', ')} also list #{old_unit_name.dump}: pass each as --course, " \
      "or the course file left behind will name a unit that no longer exists."
  end

  [options[:unit], course_renames]
end

# The offering to rename with a course is the one keyed by that course's own
# name. An offering keyed by anything else is keyed by a family name shared
# with the course's other versions: moving its file into the ui-test tree
# would take an offering those production courses still seed.
def offering_to_rename(unit_group, old_name)
  offering = unit_group.course_version&.course_offering
  return nil if offering.nil?

  unless offering.key == old_name
    raise "course #{old_name.dump} belongs to course offering #{offering.key.dump}, which is keyed " \
      "by its family name rather than by the course. Renaming that offering would move a file its " \
      "other versions still seed. Migrate it by hand, or extend this script."
  end

  version_count = offering.course_versions.count
  unless version_count == 1
    raise "course offering #{offering.key.dump} has #{version_count} course versions; this script " \
      "only moves an offering that belongs to one course. Migrate it by hand, or extend this script."
  end

  offering
end

# Returns the paths the rename leaves behind, to delete once the replacements
# have been written.
def rename_course(course)
  old_paths = [UnitGroup.file_path(course.old_name)]

  if course.offering
    old_paths << CourseOffering.file_path(course.offering.key)
    new_display_name = course.offering.display_name == course.offering.key ? course.new_name : course.offering.display_name
    course.offering.update!(key: course.new_name, display_name: new_display_name)
    course.offering.write_serialization
  end

  course.unit_group.name = course.new_name
  course.unit_group.family_name = course.new_name if course.unit_group.family_name == course.old_name
  course.unit_group.save!

  puts "renamed course #{course.old_name} -> #{course.new_name}"
  old_paths
end

def rename_unit(old_name, new_name)
  unit = Unit.find_by_name!(old_name)
  unit.update!(name: new_name)
  regenerate_seeding_keys(unit)
  unit.reload.write_script_json

  puts "renamed unit #{old_name} -> #{new_name}"
  [Unit.script_json_filepath(old_name)]
end

# lesson_activities.key, activity_sections.key and objectives.key are unique
# across their whole table rather than scoped to a script -- the only three
# seeding keys that are -- so the renamed unit may not keep the keys it was
# serialized with. Any database still holding the unit under its old name (the
# production original stays in the repo, and every deployed environment keeps
# its rows until someone deletes them by hand) would otherwise have the two
# fight over the same rows: ScriptSeed imports with on_duplicate_key_update,
# so whichever seeds second takes them, leaving the loser's lesson plans with
# no sections or objectives and its script_levels attached to the winner's
# sections.
def regenerate_seeding_keys(unit)
  counts = Hash.new(0)
  unit.lessons.each do |lesson|
    lesson.lesson_activities.each do |activity|
      activity.update!(key: SecureRandom.uuid)
      counts[:lesson_activities] += 1
      activity.activity_sections.each do |activity_section|
        activity_section.update!(key: SecureRandom.uuid)
        counts[:activity_sections] += 1
      end
    end
    lesson.objectives.each do |objective|
      objective.update!(key: SecureRandom.uuid)
      counts[:objectives] += 1
    end
  end

  puts "regenerated seeding keys: #{counts.map {|table, count| "#{count} #{table}"}.join(', ')}"
end

# Move every hash key equal to old_name to new_name, keeping each key's
# position implicit ordering (to_yaml re-sorts nothing; insertion order is
# preserved, so the moved entry stays where the old one was). Values equal to
# the old slug under a "name" or "title" key are slug echoes, not prose;
# re-point them at the new slug.
def deep_rename!(node, old_name, new_name)
  case node
  when Hash
    if node.key?(old_name) && node.key?(new_name)
      raise "cannot rename i18n key #{old_name.dump} to #{new_name.dump}: both are already present, " \
        "and merging them would silently drop one entry."
    end
    node.transform_keys! {|k| k == old_name ? new_name : k}
    node.each do |key, value|
      if SLUG_ECHO_KEYS.include?(key) && value == old_name
        node[key] = new_name
      else
        deep_rename!(value, old_name, new_name)
      end
    end
  when Array
    node.each {|value| deep_rename!(value, old_name, new_name)}
  end
end

def move_i18n_keys(yml_path, renames)
  i18n = YAML.load_file(yml_path)
  before = i18n.deep_dup
  renames.each {|old_name, new_name| deep_rename!(i18n, old_name, new_name)}
  return if i18n == before

  File.write(yml_path, "# Autogenerated scripts locale file.\n" + i18n.to_yaml(line_width: -1))
  puts "moved i18n keys in #{yml_path}"
end

def main(options)
  # Make sure never to run this script in the levelbuilder environment, which
  # would otherwise pass the levelbuilder_mode check, and potentially mess up
  # production curriculum data.
  raise "this script must run in development, not #{rack_env}" unless rack_env?(:development)
  unless Rails.application.config.levelbuilder_mode
    raise "levelbuilder_mode must be enabled so config files are written; set levelbuilder_mode: true in locals.yml"
  end

  unit_rename, course_renames = preflight(options)

  old_paths = ActiveRecord::Base.transaction do
    paths = course_renames.flat_map {|course| rename_course(course)}
    paths += rename_unit(*unit_rename)

    # Course serialization embeds unit names, so write it only after the unit
    # rename has landed.
    course_renames.each {|course| course.unit_group.reload.write_serialization}
    paths
  end

  move_i18n_keys("#{Rails.root}/config/locales/scripts/en.yml", [unit_rename])
  move_i18n_keys("#{Rails.root}/config/locales/courses/en.yml", course_renames.map {|course| [course.old_name, course.new_name]})

  old_paths.each {|path| delete_file(path)}
end

if __FILE__ == $0
  options = parse_options
  require_rails_env
  main(options)
end
