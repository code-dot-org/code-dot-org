# == Schema Information
#
# Table name: levels_script_levels
#
#  level_id        :integer          not null
#  script_level_id :integer          not null
#
# Indexes
#
#  index_levels_script_levels_on_level_id                      (level_id)
#  index_levels_script_levels_on_script_level_id               (script_level_id)
#  index_levels_script_levels_on_script_level_id_and_level_id  (script_level_id,level_id) UNIQUE
#

# Join table.
# Don't add anything to this model; used for convenience for ActiveRecord Import.
class LevelsScriptLevel < ActiveRecord::Base
  belongs_to :script_level
  belongs_to :level

  def seeding_key(seed_context)
    my_level = seed_context.levels.select {|l| l.id == level_id}.first
    raise "No Level found for #{self.class}: #{inspect}" unless my_level
    # TODO: make this use the SeedContext?
    my_key = {'level.name': my_level.unique_key}

    my_script_level = seed_context.script_levels.select {|sl| sl.id == script_level_id}.first
    raise "No ScriptLevel found for #{self.class}: #{inspect}" unless my_script_level
    script_level_seeding_key = my_script_level.seeding_key(seed_context)

    my_key.merge!(script_level_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
    my_key.stringify_keys
  end
end
