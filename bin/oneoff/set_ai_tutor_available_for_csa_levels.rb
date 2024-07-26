# This script finds all levels currently used in CSA scripts and sets the property
# ai_tutor_available to true. Levelbuilders will have the ability to set ai_tutor_available
# on a per level basis via the level edit page. Initially, we want to default ai_tutor_available to
# true for CSA levels and false for levels in all other curricula.

require_relative '../../dashboard/config/environment'
require src_dir 'database'

count_levels_updated = 0

time_taken = Benchmark.realtime do
  ActiveRecord::Base.transaction do
    Level.includes(:script_levels).all.select {|level| level.script_levels.any? {|sl| sl.script.csa?}}.each do |csa_level|
      csa_level.properties["ai_tutor_available"] = true
      csa_level.save!
      count_levels_updated += 1
    end
  end
end

puts "It took #{time_taken} seconds to set ai_tutor_available to true for #{count_levels_updated} CSA levels."
