# == Schema Information
#
# Table name: learning_goal_teacher_evaluations
#
#  id               :bigint           not null, primary key
#  user_id          :integer          not null
#  teacher_id       :integer          not null
#  learning_goal_id :integer          not null
#  project_id       :integer
#  project_version  :string(255)
#  understanding    :integer
#  feedback         :text(65535)
#  submitted_at     :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_learning_goal_teacher_evaluations_on_learning_goal_id     (learning_goal_id)
#  index_learning_goal_teacher_evaluations_on_teacher_id           (teacher_id)
#  index_learning_goal_teacher_evaluations_on_user_and_teacher_id  (user_id,teacher_id)
#
class LearningGoalTeacherEvaluation < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :public,
    user_id: :public,
    teacher_id: :public,
    learning_goal_id: :public,
    project_id: :public,
    project_version: :confidential,
    understanding: :public,
    feedback: :restricted,
    submitted_at: :confidential,
    created_at: :public,
    updated_at: :public,
  )

  belongs_to :learning_goal
  belongs_to :user
  belongs_to :teacher, class_name: 'User'

  def summarize_for_participant
    {
      id: id,
      learning_goal_id: learning_goal_id,
      understanding: understanding,
      feedback: feedback,
    }
  end
end
