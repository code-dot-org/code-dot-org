require 'cdo/shared_constants'

# == Schema Information
#
# Table name: rubric_ai_evaluations
#
#  id              :bigint           not null, primary key
#  user_id         :integer          not null
#  requester_id    :integer          not null
#  rubric_id       :bigint           not null
#  project_id      :integer          not null
#  project_version :string(255)
#  status          :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_rubric_ai_evaluations_on_user_id  (user_id)
#  rubric_ai_evaluation_requester_index    (requester_id)
#  rubric_ai_evaluation_rubric_index       (rubric_id)
#
class RubricAiEvaluation < ApplicationRecord
  belongs_to :user
  belongs_to :requester, class_name: 'User'
  belongs_to :rubric

  has_many :learning_goal_ai_evaluations, inverse_of: :rubric_ai_evaluation

  validates :status, inclusion: {in: SharedConstants::RUBRIC_AI_EVALUATION_STATUS.values}

  def summarize_debug
    script_level = rubric.get_script_level
    {
      id: id,
      created_at: created_at,
      updated_at: updated_at,
      user_id: user_id,
      script_level_id: script_level&.id,
      username: user.username,
      requester_username: requester&.username,
      unit_name: script_level&.script&.name,
      lesson_position: rubric.lesson.absolute_position,
      level_name: rubric.level.name,
      status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS.invert[status].to_s,
      num_learning_goal_ai_evaluations: learning_goal_ai_evaluations.count,
    }
  end

  def queued?
    status == SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:QUEUED]
  end

  def running?
    status == SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:RUNNING]
  end

  def succeeded?
    status == SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS] && !failed?
  end

  def failed?
    status >= SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:FAILURE]
  end

  def pii_failure?
    status == SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PII_VIOLATION]
  end

  def profanity_failure?
    status == SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PROFANITY_VIOLATION]
  end

  def share_filtering_failure?
    pii_failure? || profanity_failure?
  end
end
