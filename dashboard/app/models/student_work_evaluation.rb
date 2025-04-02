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
  VALID_TYPES = ['UserLevelSkillEvaluation', 'UserLevelEvaluation', 'SectionLevelEvaluation'].freeze

  validates :type, inclusion: {in: VALID_TYPES}
end
