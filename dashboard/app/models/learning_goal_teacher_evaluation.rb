# == Schema Information
#
# Table name: learning_goal_teacher_evaluations
#
#  id               :bigint           not null, primary key
#  user_id          :integer          not null
#  teacher_id       :integer          not null
#  learning_goal_id :integer          not null
#  understanding    :integer          not null
#  draft_feedback   :text(65535)
#  feedbacks        :text(65535)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_learning_goal_teacher_evaluations_on_learning_goal_id     (learning_goal_id)
#  index_learning_goal_teacher_evaluations_on_user_and_teacher_id  (user_id,teacher_id)
#
class LearningGoalTeacherEvaluation < ApplicationRecord
end
