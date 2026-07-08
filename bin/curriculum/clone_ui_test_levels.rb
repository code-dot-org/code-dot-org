#!/usr/bin/env ruby

# Clone the levels referenced by ui-test-* units into "UI Test "-prefixed
# copies stored under dashboard/test/ui/config, and repoint the units'
# script_levels at the copies.
#
# For each script_level of each given unit, get-or-create the level named
# "UI Test <original name>", recursively cloning contained levels, project
# template levels, and LevelGroup/BubbleChoice sublevels with the same prefix
# and rewriting those references to the new names. Deprecated blockly levels
# (blockly:* keys) are exempt from the partition and carried over unchanged.
# Then the script_level is repointed and the unit's script_json regenerated.
#
# Must run with levelbuilder_mode on so the level after_save hooks write the
# new definition files (under dashboard/test/ui/config); commit the result.
# Idempotent: clones are found by name on re-run.
#
# Usage: bin/curriculum/clone_ui_test_levels.rb -u ui-test-csf,ui-test-shared-unit

require 'optparse'

$verbose = false

UI_TEST_LEVEL_NAME_PREFIX = 'UI Test '.freeze

def parse_options
  options = {}

  OptionParser.new do |opts|
    opts.banner = "Usage: clone_ui_test_levels.rb -u UnitName1,UnitName2 [options]"

    opts.on("-u", "--unit_names UnitName1,UnitName2", Array, "Names of the ui-test-* units to migrate") do |unit_names|
      options[:unit_names] = unit_names
    end

    opts.on("-v", "--verbose", "Use verbose debug logging") do
      $verbose = true
    end

    opts.on("-h", "--help", "Prints this help") do
      puts opts
      exit
    end
  end.parse!

  # NOTE: activesupport (blank?) is not loaded until require_rails_env.
  raise "Unit names required. Use -h for options." if options[:unit_names].nil? || options[:unit_names].empty?
  options
end

def require_rails_env
  puts "loading rails environment..." if $verbose
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  puts "rails environment loaded in #{(Time.now - start_time).to_i} seconds." if $verbose
end

# Get-or-create the "UI Test " copy of the given level, cloning descendants
# as needed. Returns the level itself for deprecated blockly levels.
def clone_level(level)
  return level if level.key.start_with?('blockly:')

  new_name = "#{UI_TEST_LEVEL_NAME_PREFIX}#{level.name}"
  if new_name.length > 70
    raise "cannot clone #{level.name.dump}: #{new_name.dump} exceeds the 70 character level name limit"
  end

  existing = Level.find_by_name(new_name)
  return existing if existing

  puts "cloning #{level.name.dump} -> #{new_name.dump}" if $verbose
  clone = level.is_a?(DSLDefined) ? clone_dsl_level(level, new_name) : clone_custom_level(level, new_name)
  raise "clone of #{level.name.dump} did not produce a UI Test level" unless clone&.ui_test?
  clone
end

# DSL levels are cloned by rewriting their definition text: the name line,
# plus the sublevel references of LevelGroup/BubbleChoice parents (their
# children are cloned first, so LevelGroup.setup can resolve them). The
# rewritten text is fed back through create_from_level_builder, which writes
# the new file at its canonical path under test/ui/config/scripts.
def clone_dsl_level(level, new_name)
  if level.level_encrypted? && CDO.properties_encryption_key.blank?
    raise "cannot clone encrypted level #{level.name.dump} without properties_encryption_key; " \
      "see the plan's step-3 encrypted-DSL contingency"
  end

  dsl_text = level.dsl_text
  raise "no dsl text found for level #{level.name.dump}" if dsl_text.blank?

  new_text = dsl_text.sub("name '#{level.name}'", "name '#{new_name}'")
  raise "name not formatted correctly in dsl text for level #{level.name.dump}" if new_text == dsl_text

  if level.is_a?(LevelGroup) || level.is_a?(BubbleChoice)
    level.all_child_levels.uniq.each do |child|
      child_clone = clone_level(child)
      new_text = new_text.gsub("level '#{child.name}'", "level '#{child_clone.name}'")
    end
  end

  level_params = {}
  level_params[:encrypted] = true if level.level_encrypted?
  level.class.create_from_level_builder({dsl_text: new_text}, level_params)
end

# Custom levels are cloned via Level#clone_with_name, then any contained or
# project template level references are cloned recursively and remapped.
def clone_custom_level(level, new_name)
  contained_names = Array(level.contained_level_names).map {|name| clone_level(Level.find_by_name!(name)).name}
  template_name = level.project_template_level_name && clone_level(Level.find_by_name!(level.project_template_level_name)).name

  clone = level.clone_with_name(new_name)

  update_params = {}
  update_params[:contained_level_names] = contained_names if contained_names.present?
  update_params[:project_template_level_name] = template_name if template_name
  clone.update!(update_params) if update_params.present?

  if level.level_concept_difficulty && clone.level_concept_difficulty.nil?
    clone.level_concept_difficulty = level.level_concept_difficulty.dup
    clone.save!
  end

  clone
end

def migrate_unit(unit)
  raise "#{unit.name.dump} is not a ui-test-* unit" unless unit.name.start_with?('ui-test-')

  unit.script_levels.each do |script_level|
    raise "script_level #{script_level.id} uses variants, which this script does not handle" if script_level.variants.present?

    mapped_levels = script_level.levels.map {|level| clone_level(level)}
    next if mapped_levels == script_level.levels.to_a

    script_level.levels = mapped_levels
    script_level.update!(level_keys: mapped_levels.map(&:key))
    puts "repointed script_level #{script_level.id}: #{mapped_levels.map(&:name).join(', ')}" if $verbose
  end

  unit.reload.write_script_json
  puts "migrated #{unit.name}"
end

def main(options)
  unless Rails.application.config.levelbuilder_mode
    raise "levelbuilder_mode must be enabled so level files are written; set levelbuilder_mode: true in locals.yml"
  end

  options[:unit_names].each do |unit_name|
    unit = Unit.find_by(name: unit_name)
    raise "Unit not found: #{unit_name}" if unit.nil?
    migrate_unit(unit)
  end
end

options = parse_options
require_rails_env
main(options)
