class AddStatusToLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_ai_evaluations, :status, :integer, default: 0
  end
end
