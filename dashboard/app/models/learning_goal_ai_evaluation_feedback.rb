# == Schema Information
#
# Table name: learning_goal_ai_evaluation_feedbacks
#
#  id                             :bigint           not null, primary key
#  learning_goal_ai_evaluation_id :bigint           not null
#  teacher_id                     :bigint           not null
#  ai_feedback_approval           :boolean          not null
#  false_positive                 :boolean
#  false_negative                 :boolean
#  vague                          :boolean
#  feedback_other                 :boolean
#  other_content                  :text(65535)
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#
# Indexes
#
#  index_feedback_on_learning_goal_ai_evaluation  (learning_goal_ai_evaluation_id)
#
class LearningGoalAiEvaluationFeedback < ApplicationRecord
  belongs_to :learning_goal_ai_evaluation
end
