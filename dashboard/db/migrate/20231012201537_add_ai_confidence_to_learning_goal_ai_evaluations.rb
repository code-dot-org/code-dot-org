class AddAiConfidenceToLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_ai_evaluations, :ai_confidence, :integer
  end
end
