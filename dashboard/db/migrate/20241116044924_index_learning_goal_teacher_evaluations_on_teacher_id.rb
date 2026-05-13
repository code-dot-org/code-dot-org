class IndexLearningGoalTeacherEvaluationsOnTeacherId < ActiveRecord::Migration[6.1]
  def change
    add_index :learning_goal_teacher_evaluations, :teacher_id
  end
end
