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
#  evaluation_criteria :string(255)
#  reasoning           :string(255)
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
class UserLevelSkillEvaluation < StudentWorkEvaluation
  alias_attribute :user_id, :student_id
  alias_attribute :script_id, :unit_id

  validates :student_id, presence: true
  validates :level_id, presence: true
  validates :unit_id, presence: true
  # TODO: Add validation for skill_id
end
