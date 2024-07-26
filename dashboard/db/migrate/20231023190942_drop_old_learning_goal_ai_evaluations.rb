class DropOldLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    drop_table :old_learning_goal_ai_evaluations
  end
end
