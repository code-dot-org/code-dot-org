class CreateLearningGoals < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goals do |t|
      t.string :key
      t.integer :position
      t.integer :rubric_id
      t.string :learning_goal
      t.boolean :ai_enabled
      t.text :tips

      t.timestamps
    end
  end
end
