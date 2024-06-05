class AddObservationsToLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_ai_evaluations, :observations, :text
  end
end
