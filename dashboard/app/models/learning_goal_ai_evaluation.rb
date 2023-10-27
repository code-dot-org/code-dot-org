# == Schema Information
#
# Table name: learning_goal_ai_evaluations
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
#  index_learning_goal_ai_evaluations_on_learning_goal_id  (learning_goal_id)
#  index_learning_goal_ai_evaluations_on_requester_id      (requester_id)
#  index_learning_goal_ai_evaluations_on_user_id           (user_id)
#
class LearningGoalAiEvaluation < ApplicationRecord
  belongs_to :learning_goal
  has_one :rubric, through: :learning_goal
  has_one :lesson, through: :rubric
  has_one :level, through: :rubric

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

  def summarize_debug
    script_level = rubric.get_script_level
    {
      id: id,
      user_id: user_id,
      script_level_id: script_level&.id,
      username: user.username,
      requester_username: requester&.username,
      unit_name: script_level&.script&.name,
      lesson_position: lesson.absolute_position,
      level_name: level.name,
      learning_goal: learning_goal.learning_goal,
      understanding: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.to_h.invert[understanding].to_s,
      ai_confidence: AI_CONFIDENCE_LEVELS.invert[ai_confidence].to_s,
    }
  end
end
