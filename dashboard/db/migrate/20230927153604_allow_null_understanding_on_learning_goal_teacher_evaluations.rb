class AllowNullUnderstandingOnLearningGoalTeacherEvaluations < ActiveRecord::Migration[6.1]
  def change
    change_column_null :learning_goal_teacher_evaluations, :understanding, true
  end
end
