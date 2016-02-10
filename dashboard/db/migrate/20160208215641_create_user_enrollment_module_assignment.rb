class CreateUserEnrollmentModuleAssignment < ActiveRecord::Migration
  def change
    create_table :user_enrollment_module_assignments do |t|
      t.references :professional_learning_module, index: {name: 'module_assignment_module_index'}
      t.references :user_professional_learning_course_enrollment, index: {name: 'module_assignment_enrollment_index'}
    end
  end
end
