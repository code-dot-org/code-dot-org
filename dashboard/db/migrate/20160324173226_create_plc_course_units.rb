class CreatePlcCourseUnits < ActiveRecord::Migration
  def change
    create_table :plc_course_units do |t|
      t.references :plc_course, index: true, foreign_key: true
      t.string :unit_name
      t.string :unit_description
      t.integer :unit_order

      t.timestamps null: false
    end

    # At this time of this migration, there are no EvaluationQuestions so it's safe to blow them up
    Plc::EvaluationQuestion.destroy_all

    # We also have to alter the evaluation question table to point at course units
    rename_column :plc_evaluation_questions, :plc_course_id, :plc_course_unit_id
  end
end
