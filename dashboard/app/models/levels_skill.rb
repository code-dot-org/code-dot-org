# == Schema Information
#
# Table name: levels_skills
#
#  level_id :bigint           not null
#  skill_id :bigint           not null
#
# Indexes
#
#  index_levels_skills_on_level_id_and_skill_id  (level_id,skill_id)
#  index_levels_skills_on_skill_id_and_level_id  (skill_id,level_id)
#
class LevelsSkill < ApplicationRecord
  belongs_to :level
  belongs_to :skill

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated
  # objects are needed, then data from the seeding_keys of those objects should
  # be included as well. Ideally should correspond to a unique index for this
  # model's table. See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_level = seed_context.levels.select {|l| l.id == level_id}.first
    my_skill = seed_context.skills.select {|s| s.id == skill_id}.first
    {
      'level.key' => my_level.key,
      'skill.key' => my_skill.key
    }.stringify_keys
  end
end
