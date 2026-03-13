#!/usr/bin/env ruby

# This script updates the ai_tutor_available property for levels:
#   * Sets ai_tutor_available to "false" for all CSA levels and their sublevels
#   * Sets ai_tutor_available to "true" for CSD 2025 levels and their sublevels
#   * Sets ai_tutor_available to "true" for AIF 2025 Unit 2 levels and their sublevels
#   * Sets ai_tutor_available to "true" for some specific standalone projects
#
# The ai_tutor_available property is stored as the string "true"/"false" in
# Level#properties, matching Level#ai_tutor_available?.
#
# This script updates each Level via save! so that after_save callbacks run
# (specifically LevelFiles.write_custom_level_file)

require_relative '../../dashboard/config/environment'
require 'cdo/db'

dry_run = ARGV.include?('--dry-run')

CSA_UMBRELLA = Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSA

def update_levels_and_sublevels(level_scope, ai_value, counts, key, dry_run)
  level_ids = level_scope.distinct.pluck(:id)
  sublevel_ids = ParentLevelsChildLevel.where(parent_level_id: level_ids).pluck(:child_level_id).uniq

  Level.where(id: level_ids).find_each(batch_size: 100) do |level|
    next if level.properties['ai_tutor_available'] == ai_value

    level.properties['ai_tutor_available'] = ai_value unless dry_run
    level.save! unless dry_run
    counts[key][:levels] += 1
  end

  Level.where(id: sublevel_ids).find_each(batch_size: 100) do |sublevel|
    next if sublevel.properties['ai_tutor_available'] == ai_value

    sublevel.properties['ai_tutor_available'] = ai_value unless dry_run
    sublevel.save! unless dry_run
    counts[key][:sublevels] += 1
  end
end

counts = {
  csa: {levels: 0, sublevels: 0},
  csd: {levels: 0, sublevels: 0},
  aif_unit2: {levels: 0, sublevels: 0},
  standalone: {levels: 0, sublevels: 0},
}

time_taken = Benchmark.realtime do
  ActiveRecord::Base.transaction do
    # CSA: set ai_tutor_available to "false" on levels and sublevels
    csa_unit_ids = Unit.where("properties -> '$.curriculum_umbrella' = ?", CSA_UMBRELLA).pluck(:id)
    csa_levels = Level.joins(:script_levels).where(script_levels: {script_id: csa_unit_ids})
    update_levels_and_sublevels(csa_levels, 'false', counts, :csa, dry_run)

    # CSD: set ai_tutor_available to "true" on levels and sublevels
    csd_unit_ids = Unit.where(name: %w(
                                csd1-2025
                                csd2-2025
                                csd3-2025
                                csd4-2025
                                csd5-2025
                                csd6a-2025
                                csd6b-2025
                                csd7-2025
                                programming-with-music-lab-2025
                              )
).pluck(:id)
    csd_levels = Level.joins(:script_levels).where(script_levels: {script_id: csd_unit_ids})
    update_levels_and_sublevels(csd_levels, 'true', counts, :csd, dry_run)

    # AIF Unit 2: set ai_tutor_available to "true" on levels and sublevels
    aif_unit2_ids = Unit.
      where(name: 'aif2-2025').
      pluck(:id)
    aif_unit2_levels = Level.joins(:script_levels).where(script_levels: {script_id: aif_unit2_ids})
    update_levels_and_sublevels(aif_unit2_levels, 'true', counts, :aif_unit2, dry_run)

    # Standalone projects: set ai_tutor_available to "true" on levels and sublevels
    standalone_project_levels = Level.where(name: [
                                              'New App Lab Project',
                                              'New Game Lab Project',
                                              'New Web Lab Project',
                                              'New Python Lab Project',
                                              'New Web Lab 2 Project',
                                            ]
)
    update_levels_and_sublevels(standalone_project_levels, 'true', counts, :standalone, dry_run)
  end
end

puts "It took #{time_taken} seconds to update ai_tutor_available:"
puts "CSA -> \"false\" for #{counts[:csa][:levels]} levels and #{counts[:csa][:sublevels]} sublevels."
puts "CSD -> \"true\" for #{counts[:csd][:levels]} levels and #{counts[:csd][:sublevels]} sublevels."
puts "AIF U2 -> \"true\" for #{counts[:aif_unit2][:levels]} levels and #{counts[:aif_unit2][:sublevels]} sublevels."
puts "Standalone -> \"true\" for #{counts[:standalone][:levels]} levels and #{counts[:standalone][:sublevels]} sublevels."
