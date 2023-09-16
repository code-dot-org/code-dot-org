# == Schema Information
#
# Table name: learning_goal_evaluations
#
#  id               :bigint           not null, primary key
#  user_id          :integer
#  teacher_id       :integer
#  unit_id          :integer
#  level_id         :integer
#  learning_goal_id :integer
#  ai_sourced       :boolean
#  prompt_version   :date
#  understanding    :integer
#  feedback         :text(65535)
#  context          :text(65535)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  submitted_at     :datetime
#
class LearningGoalEvaluation < ApplicationRecord
  belongs_to :learning_goal
  belongs_to :user
  belongs_to :teacher, class_name: 'User'
end
