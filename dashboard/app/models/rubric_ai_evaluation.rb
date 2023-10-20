require 'cdo/shared_constants'

# == Schema Information
#
# Table name: rubric_ai_evaluations
#
#  id              :bigint           not null, primary key
#  user_id         :integer          not null
#  requester_id    :integer          not null
#  project_id      :integer
#  project_version :string(255)
#  status          :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_rubric_ai_evaluations_on_project_id  (project_id)
#  index_rubric_ai_evaluations_on_user_id     (user_id)
#  rubric_ai_evaluation_requester_index       (requester_id)
#
class RubricAiEvaluation < ApplicationRecord
  belongs_to :user
  belongs_to :requester, class_name: 'User'
  belongs_to :project

  validates :status, inclusion: {in: SharedConstants::RUBRIC_AI_EVALUATION_STATUS.values}
end
