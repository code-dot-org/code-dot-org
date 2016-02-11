class RemovePlcForeignKeys < ActiveRecord::Migration
  def change
    remove_foreign_key :professional_learning_tasks, column: :professional_learning_module_id
    remove_foreign_key :user_professional_learning_course_enrollments, column: :user_id
    remove_foreign_key :user_professional_learning_course_enrollments, column: :professional_learning_course_id
    remove_foreign_key :user_enrollment_module_assignments, column: :professional_learning_module_id
    remove_foreign_key :user_enrollment_module_assignments, column: :user_professional_learning_course_enrollment_id
    remove_foreign_key :user_module_task_assignments, column: :user_enrollment_module_assignment_id
    remove_foreign_key :user_module_task_assignments, column: :professional_learning_task_id
  end
end
