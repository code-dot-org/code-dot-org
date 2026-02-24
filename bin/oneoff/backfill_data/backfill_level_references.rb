#!/usr/bin/env ruby

# https://codedotorg.atlassian.net/browse/TEACH-935
# Context
# Reference guides for curriculum was migrated to a framework that supports versioning
# But, the corresponding change needed to update version for linked reference guides when
# cloning scripts is currently missing. That is tracked by task https://codedotorg.atlassian.net/browse/TEACH-1008

# This script is a backfill to fix the reference guide version for scripts that are already
# cloned for 2024.

require_relative '../../../dashboard/config/environment'

# Override for the dry run variable using an commandline argument
DRY_RUN = !(ARGV.find {|arg| arg.casecmp('-dryrun')}).nil?

def update_reference_guide_format(unit_group_name, course_version_id, reference_guide_link)
  # Reference guide formats
  # in the old unversioned framework - /docs/concepts/patterns/random-list-access/
  # in the versioned framework - /courses/csd-2024/guides/animation-tab
  if !reference_guide_link.starts_with?("/docs/concepts") && !reference_guide_link.starts_with?("/courses/")
    return reference_guide_link
  end

  reference_guide_key = reference_guide_link.split("/").reject(&:blank?).map(&:strip).last

  reference_guide = ReferenceGuide.find_by(key: reference_guide_key, course_version_id: course_version_id)
  if reference_guide.nil?
    puts "Unable to find reference guide with key #{reference_guide_key}, should be udpated manually"
    return reference_guide_link
  end

  "/courses/#{unit_group_name}/guides/#{reference_guide_key}"
end

def backfill_level_reference_guides
  raise unless Rails.application.config.levelbuilder_mode

  backfill_unit_groups = ["csa-2024", "csd-2024", "csp-2024"]

  backfill_unit_groups.each do |unit_gp|
    unit_group = UnitGroup.find_by(name: unit_gp)
    course_ver_id = unit_group.course_version.id

    puts "Backfilling reference guides in Unit group [#{unit_gp}], course Version ID [#{course_ver_id}]"
    unit_group.default_units.each do |scpt|
      puts "Processing Unit [#{scpt.name}], ID: [#{scpt.id}]"
      next if scpt.levels.nil?

      scpt.levels.each do |level|
        puts "Processing Level [#{level.name}], ID: [#{level.id}], current reference links [#{level.reference_links}] map reference [#{level.map_reference}]"
        level_updates = false

        unless level.reference_links.nil?
          new_references = level.reference_links.map {|rl| update_reference_guide_format(unit_gp, course_ver_id, rl)}
          level.reference_links = new_references
          level_updates = true
        end

        unless level.map_reference.nil?
          level.map_reference = update_reference_guide_format(unit_gp, course_ver_id, level.map_reference)
          level_updates = true
        end

        next unless level_updates

        puts "New reference links [#{level.reference_links}] map reference [#{level.map_reference}]"
        unless DRY_RUN
          level.save!
        end
      end
    end
  end
end

backfill_level_reference_guides
