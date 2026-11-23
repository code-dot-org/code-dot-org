# == Schema Information
#
# Table name: objectives_script_levels
#
#  script_level_id :integer          not null
#  objective_id    :integer          not null
#
# Indexes
#
#  index_objectives_script_levels_on_objective_id          (objective_id)
#  index_objectives_script_levels_on_sl_and_objective_ids  (script_level_id,objective_id) UNIQUE
#
class ObjectivesScriptLevel < ApplicationRecord
  belongs_to :objective, optional: true
  belongs_to :script_level, optional: true

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context, use_existing_level_keys: true)
    my_objective = seed_context.objectives.find {|o| o.id == objective_id}
    raise "No Objective found for #{self.class}, Objective ID: #{objective_id}" unless my_objective
    my_script_level = seed_context.script_levels.find {|sl| sl.id == script_level_id}
    raise "No ScriptLevel found for #{self.class}, ScriptLevel ID: #{script_level_id}" unless my_script_level

    my_script_level.seeding_key(seed_context, use_existing_level_keys: use_existing_level_keys).
      merge('objective.key' => my_objective.key)
  end
end
