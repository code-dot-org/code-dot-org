class CreateUserLevelEvaluations < ActiveRecord::Migration[6.1]
  def change
    create_table :user_level_evaluations do |t|
      t.integer :user_id, null: false
      t.integer :level_id, null: false
      t.integer :script_id, null: false
      t.string :school_year, null: false
      t.text :evaluation_criteria
      t.text :ai_evaluation
      t.text :ai_reasoning
      t.string :ai_model_version

      t.timestamps

      t.index :user_id
      t.index :level_id
    end
  end
end
