class CreateLearningGoals < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goals do |t|
      t.integer :position
      t.integer :lesson_id
      t.integer :level_id
      t.string :learning_goal
      t.boolean :ai_enabled

      t.timestamps
    end
  end
end
