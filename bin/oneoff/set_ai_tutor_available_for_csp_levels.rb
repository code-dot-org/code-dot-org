#!/usr/bin/env ruby

# This script updates the ai_tutor_available property for levels:
#   * Sets ai_tutor_available to "true" for CSP 2025 levels and their sublevels
#
# The ai_tutor_available property is stored as the string "true"/"false" in
# Level#properties, matching Level#ai_tutor_available?.
#
# This script updates each Level via save! so that after_save callbacks run
# (specifically LevelFiles.write_custom_level_file)

require_relative '../../dashboard/config/environment'
require 'cdo/db'

dry_run = ARGV.include?('--dry-run')

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
  csp: {levels: 0, sublevels: 0},
}

time_taken = Benchmark.realtime do
  ActiveRecord::Base.transaction do
    # CSP: set ai_tutor_available to "true" on levels and sublevels
    csp_unit_ids = Unit.where(name: %w(
                                csp1-2025
                                csp2-2025
                                csp3-2025
                                csp4-2025
                                csp5-2025
                                csp6-2025
                                csp7-2025
                                csp8-2025
                                csp9-2025
                                csp10-2025
                              )
).pluck(:id)
    csp_levels = Level.joins(:script_levels).where(script_levels: {script_id: csp_unit_ids})
    update_levels_and_sublevels(csp_levels, 'true', counts, :csp, dry_run)
  end
end

puts "It took #{time_taken} seconds to update ai_tutor_available:"
puts "CSP -> \"true\" for #{counts[:csp][:levels]} levels and #{counts[:csp][:sublevels]} sublevels."
