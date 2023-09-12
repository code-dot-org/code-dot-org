class CreateLearningGoalAiEvaluatons < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goal_ai_evaluatons do |t|
      t.integer :user_id
      t.integer :learning_goal_id
      t.datetime :prompt_version
      t.integer :userstanding
      t.text :context

      t.timestamps

      t.index :learning_goal_id
      t.index :user_id
    end
  end
end
