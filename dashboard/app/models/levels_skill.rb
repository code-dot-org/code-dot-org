# == Schema Information
#
# Table name: levels_skills
#
#  id         :bigint           not null, primary key
#  skill_key  :string(255)      not null
#  level_key  :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_levels_skills_on_level_key                (level_key)
#  index_levels_skills_on_skill_key                (skill_key)
#  index_levels_skills_on_skill_key_and_level_key  (skill_key,level_key) UNIQUE
#
class LevelsSkill < ApplicationRecord
  belongs_to :level
  belongs_to :skill
end
