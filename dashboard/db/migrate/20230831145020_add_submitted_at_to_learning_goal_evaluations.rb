class AddSubmittedAtToLearningGoalEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_evaluations, :submitted_at, :datetime
  end
end
