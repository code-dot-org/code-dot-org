class CreateLearningGoalEvidenceLevels < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goal_evidence_levels do |t|
      t.integer :learning_goal_id
      t.integer :understanding
      t.text :teacher_description
      t.text :ai_prompt

      t.timestamps
    end
  end
end
