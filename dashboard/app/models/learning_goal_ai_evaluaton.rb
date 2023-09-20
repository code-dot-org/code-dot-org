# == Schema Information
#
# Table name: learning_goal_ai_evaluatons
#
#  id               :bigint           not null, primary key
#  user_id          :integer
#  learning_goal_id :integer
#  project_id       :integer
#  project_version  :string(255)
#  understanding    :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_learning_goal_ai_evaluatons_on_learning_goal_id  (learning_goal_id)
#  index_learning_goal_ai_evaluatons_on_user_id           (user_id)
#
class LearningGoalAiEvaluaton < ApplicationRecord
end
