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
#
# Indexes
#
#  index_learning_goal_ai_evaluations_on_learning_goal_id  (learning_goal_id)
#  index_learning_goal_ai_evaluations_on_requester_id      (requester_id)
#  index_learning_goal_ai_evaluations_on_user_id           (user_id)
#
class LearningGoalAiEvaluation < ApplicationRecord
  belongs_to :learning_goal
  belongs_to :user
  belongs_to :requester, class_name: 'User'

  def summarize_for_instructor
    {
      id: id,
      understanding: understanding,
      learning_goal_id: learning_goal_id,
    }
  end
end
