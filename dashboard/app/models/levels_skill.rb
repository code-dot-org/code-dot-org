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

  def seeding_key(seed_context)
    # puts "-----------------"
    # puts "seed_context.levels #{seed_context.levels}"
    my_level = seed_context.levels.select {|l| l.id == level_id}.first
    my_skill = seed_context.skills.select {|s| s.id == skill_id}.first
    {
      'level.key' => my_level.id,
      'skill.key' => my_skill.id
    }.stringify_keys
  end
end
