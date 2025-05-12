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
#  key                 :string(255)      not null
#
# Indexes
#
#  index_skills_on_key  (key) UNIQUE
#
class Skill < ApplicationRecord
  validates :description, presence: true

  has_and_belongs_to_many :levels, join_table: 'levels_skills'

  def seeding_key(seed_context)
    key
  end

  def self.find_by_key(key)
    Skill.where(key: key).first
  end

  def self.setup
    sample_skills = [
      {
        key: "variables_declare",
        description: "Declare variables correctly",
        evaluation_criteria: "Did the students declare all of the variables in their code correctly?",
        concept: "Variables"
      },
      {
        key: "variables_name",
        description: "Name variables according to conventions",
        evaluation_criteria: "Are there any spaces in variable names? Are there any misspelled variable names? Do variable names follow casing conventions?",
        concept: "Variables"
      },
      {
        key: "variables_increment",
        description: "Increment values stored in variables",
        evaluation_criteria: "Does the student's added code increment the values stored in the variables correctly?",
        concept: "Variables"
      },
    ]
    transaction do
      Skill.import! sample_skills
    end
  end
end
