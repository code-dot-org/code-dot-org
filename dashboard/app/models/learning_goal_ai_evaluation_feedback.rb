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
  export_to_analytics

  data_classification(
    id: :confidential,
    learning_goal_ai_evaluation_id: :confidential,
    teacher_id: :confidential,
    ai_feedback_approval: :confidential,
    false_positive: :confidential,
    false_negative: :confidential,
    vague: :confidential,
    feedback_other: :confidential,
    other_content: :restricted,
    created_at: :confidential,
    updated_at: :confidential,
  )

  belongs_to :learning_goal_ai_evaluation
end
