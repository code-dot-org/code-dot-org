class CreatePlcEnrollmentModuleAssignments < ActiveRecord::Migration
  def change
    create_table :plc_enrollment_module_assignments do |t|
      t.references :plc_user_course_enrollment, index: {name: 'module_assignment_enrollment_index'}
      t.references :plc_learning_module, index: {name: 'module_assignment_lm_index'}

      t.timestamps null: false
    end
  end
end
