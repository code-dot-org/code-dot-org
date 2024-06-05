class AddEvidenceToLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_ai_evaluations, :evidence, :text
  end
end
