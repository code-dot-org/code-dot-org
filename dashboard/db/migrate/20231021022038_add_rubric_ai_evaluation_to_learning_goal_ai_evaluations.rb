class AddRubricAiEvaluationToLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    # Move old table out of the way
    rename_table :learning_goal_ai_evaluations, :old_learning_goal_ai_evaluations

    # Create a new LearningGoalAiEvaluations table
    create_table :learning_goal_ai_evaluations do |t|
      t.references :rubric_ai_evaluation, index: true, foreign_key: true, null: false
      t.references :learning_goal, index: true, foreign_key: true, null: false
      t.integer :understanding
      t.integer :ai_confidence

      t.timestamps
    end
  end
end
