class CreatePlcEnrollmentEvaluations < ActiveRecord::Migration
  def change
    create_table :plc_enrollment_evaluations do |t|
      t.references :user_professional_learning_course_enrollment, index: {name: 'enrollment_evaluation_index'}
      t.text :plc_evaluation_answers

      t.timestamps null: false
    end
  end
end
