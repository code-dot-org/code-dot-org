# == Schema Information
#
# Table name: learning_goal_ai_evaluations
#
#  id                      :bigint           not null, primary key
#  rubric_ai_evaluation_id :bigint           not null
#  learning_goal_id        :bigint           not null
#  understanding           :integer
#  ai_confidence           :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_learning_goal_ai_evaluations_on_learning_goal_id         (learning_goal_id)
#  index_learning_goal_ai_evaluations_on_rubric_ai_evaluation_id  (rubric_ai_evaluation_id)
#
class LearningGoalAiEvaluation < ApplicationRecord
  belongs_to :rubric_ai_evaluation, inverse_of: :learning_goal_ai_evaluations
  belongs_to :learning_goal

  has_one :user, through: :rubric_ai_evaluation
  has_one :requester, through: :rubric_ai_evaluation
  has_one :status, through: :rubric_ai_evaluation
  has_one :rubric, through: :learning_goal
  has_one :lesson, through: :rubric
  has_one :level, through: :rubric

  AI_CONFIDENCE_LEVELS = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  }.freeze

  validates :ai_confidence, inclusion: {in: AI_CONFIDENCE_LEVELS.values}, allow_nil: true
  validates :understanding, presence: true, inclusion: {in: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.to_h.values}

  def summarize_for_instructor
    {
      id: id,
      understanding: understanding,
      learning_goal_id: learning_goal_id,
      ai_confidence: ai_confidence,
    }
  end

  def summarize_debug
    script_level = rubric.get_script_level
    {
      id: id,
      user_id: rubric_ai_evaluation.user_id,
      script_level_id: script_level&.id,
      username: rubric_ai_evaluation.user.username,
      requester_username: rubric_ai_evaluation.requester&.username,
      unit_name: script_level&.script&.name,
      lesson_position: lesson.absolute_position,
      level_name: level.name,
      learning_goal: learning_goal.learning_goal,
      understanding: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.to_h.invert[understanding].to_s,
      ai_confidence: AI_CONFIDENCE_LEVELS.invert[ai_confidence].to_s,
    }
  end
end
