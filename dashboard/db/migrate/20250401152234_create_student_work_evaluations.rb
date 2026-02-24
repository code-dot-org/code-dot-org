class CreateStudentWorkEvaluations < ActiveRecord::Migration[6.1]
  def change
    create_table :student_work_evaluations do |t|
      t.string :type, null: false
      t.integer :student_id
      t.integer :requester_id
      t.integer :level_id
      t.integer :unit_id
      t.integer :skill_id
      t.integer :section_id
      t.string :school_year
      t.string :evaluator
      t.text :evaluation_criteria
      t.text :reasoning
      t.string :evaluation
      t.string :ai_model_version
      t.string :code_version

      t.timestamps

      t.index :type
      t.index :student_id
      t.index :level_id
    end
  end
end
