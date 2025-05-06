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

  def seeding_key(seed_context)
    {'skill.key': id}.stringify_keys
  end

  def self.setup
    sample_skills = [
      {
        description: "Declare variables correctly",
        evaluation_criteria: "Did the students declare all of the variables in their code correctly?",
        concept: "Variables"
      },
      {
        description: "Name variables according to conventions",
        evaluation_criteria: "Are there any spaces in variable names? Are there any misspelled variable names? Do variable names follow casing conventions?",
        concept: "Variables"
      },
      {
        description: "Increment values stored in variables",
        evaluation_criteria: "Does the student's added code increment the values stored in the variables correctly?",
        concept: "Variables"
      },
    ]
    transaction do
      reset_db
      Skill.import! sample_skills
    end
  end
end
