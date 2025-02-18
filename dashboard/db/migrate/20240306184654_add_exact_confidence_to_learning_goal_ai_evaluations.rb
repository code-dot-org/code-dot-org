class AddExactConfidenceToLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_ai_evaluations, :ai_confidence_exact_match, :integer
  end
end
