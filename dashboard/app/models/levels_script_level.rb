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
# Don't add anything to this model, beyond what's needed for serialization and seeding; used for convenience for ActiveRecord Import.
class LevelsScriptLevel < ApplicationRecord
  belongs_to :script_level
  belongs_to :level

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated objects are needed, then data from
  # the seeding_keys of those objects should be included as well.
  # Ideally should correspond to a unique index for this model's table.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_level = seed_context.levels.select {|l| l.id == level_id}.first
    raise "No Level found for #{self.class}: #{inspect}" unless my_level
    # TODO: make this use the SeedContext?
    my_key = {'level.key': my_level.key}

    my_script_level = seed_context.script_levels.select {|sl| sl.id == script_level_id}.first
    raise "No ScriptLevel found for #{self.class}: #{inspect}" unless my_script_level
    script_level_seeding_key = my_script_level.seeding_key(seed_context)

    my_key.merge!(script_level_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
    my_key = my_key.stringify_keys
    unless my_key['script_level.level_keys'].include?(my_key['level.key'])
      raise "invalid levels_script_levels seeding key. level.key not contained in script_level.level_keys: #{my_key}"
    end
    my_key
  end
end
