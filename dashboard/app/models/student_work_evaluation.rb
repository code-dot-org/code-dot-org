# == Schema Information
#
# Table name: student_work_evaluations
#
#  id                  :bigint           not null, primary key
#  type                :string(255)      not null
#  student_id          :integer
#  requester_id        :integer
#  level_id            :integer
#  unit_id             :integer
#  skill_id            :integer
#  section_id          :integer
#  school_year         :string(255)
#  evaluator           :string(255)
#  evaluation_criteria :text(65535)
#  reasoning           :text(65535)
#  evaluation          :string(255)
#  ai_model_version    :string(255)
#  code_version        :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_student_work_evaluations_on_level_id    (level_id)
#  index_student_work_evaluations_on_student_id  (student_id)
#  index_student_work_evaluations_on_type        (type)
#
class StudentWorkEvaluation < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :restricted,
    type: :restricted,
    student_id: :restricted,
    requester_id: :restricted,
    level_id: :restricted,
    unit_id: :restricted,
    skill_id: :restricted,
    section_id: :restricted,
    school_year: :restricted,
    evaluator: :restricted,
    evaluation_criteria: :restricted,
    reasoning: :restricted,
    evaluation: :restricted,
    ai_model_version: :restricted,
    code_version: :restricted,
    created_at: :restricted,
    updated_at: :restricted,
  )

  self.inheritance_column = :type

  has_many :ai_interaction_feedbacks, as: :ai_interaction

  VALID_TYPES = ['UserLevelSkillEvaluation', 'UserLevelEvaluation', 'SectionLevelEvaluation'].freeze

  validates :type, inclusion: {in: VALID_TYPES}
end
