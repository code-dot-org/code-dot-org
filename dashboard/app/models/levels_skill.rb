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
end
