# == Schema Information
#
# Table name: skills
#
#  id                  :bigint           not null, primary key
#  description         :string(255)      not null
#  evaluation_criteria :text(65535)
#  concept             :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
class Skill < ApplicationRecord
  validates :description, presence: true

  has_and_belongs_to_many :levels, join_table: 'levels_skills'
end
