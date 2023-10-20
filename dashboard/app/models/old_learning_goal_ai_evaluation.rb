class OldLearningGoalAiEvaluation < ApplicationRecord
  belongs_to :learning_goal
  belongs_to :user
  belongs_to :requester, class_name: 'User'

  AI_CONFIDENCE_LEVELS = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  }.freeze

  validates :ai_confidence, inclusion: {in: AI_CONFIDENCE_LEVELS.values}, allow_nil: true

  def summarize_for_instructor
    {
      id: id,
      understanding: understanding,
      learning_goal_id: learning_goal_id,
      ai_confidence: ai_confidence,
    }
  end
end
