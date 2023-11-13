class CreateLearningGoalEvaluations < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goal_evaluations do |t|
      t.integer :user_id
      t.integer :teacher_id
      t.integer :unit_id
      t.integer :level_id
      t.integer :learning_goal_id
      t.boolean :ai_sourced
      t.date :prompt_version
      t.integer :understanding
      t.text :feedback
      t.text :context

      t.timestamps
    end
  end
end
