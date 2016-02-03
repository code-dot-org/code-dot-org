class CreateUserEnrollmentModuleAssignments < ActiveRecord::Migration
  def change
    create_table :user_enrollment_module_assignments do |t|
      t.references :learning_module, index: true, foreign_key: true
      t.references :user_course_enrollment, foreign_key: true

      t.timestamps null: false
    end
  end
end
