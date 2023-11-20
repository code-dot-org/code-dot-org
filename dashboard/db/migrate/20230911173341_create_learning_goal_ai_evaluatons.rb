class CreateLearningGoalAiEvaluatons < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goal_ai_evaluations do |t|
      t.integer :user_id
      t.integer :learning_goal_id
      t.integer :project_id
      t.string :project_version
      t.integer :understanding

      t.timestamps

      t.index :learning_goal_id
      t.index :user_id
    end
  end
end
