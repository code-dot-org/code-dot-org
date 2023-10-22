# == Schema Information
#
# Table name: old_learning_goal_ai_evaluations
#
#  id               :bigint           not null, primary key
#  user_id          :integer
#  learning_goal_id :integer
#  project_id       :integer
#  project_version  :string(255)
#  understanding    :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  requester_id     :integer
#  ai_confidence    :integer
#  status           :integer          default(0)
#
# Indexes
#
#  index_old_learning_goal_ai_evaluations_on_learning_goal_id  (learning_goal_id)
#  index_old_learning_goal_ai_evaluations_on_requester_id      (requester_id)
#  index_old_learning_goal_ai_evaluations_on_user_id           (user_id)
#
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
