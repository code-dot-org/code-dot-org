class CreateUserModuleTaskAssignment < ActiveRecord::Migration
  def change
    create_table :user_module_task_assignments do |t|
      t.references :user_enrollment_module_assignment, index: {name: 'task_assignment_to_module_assignment_index'}
      t.references :professional_learning_task, index: {name: 'task_assignment_to_task_index'}
      t.string :status
    end
  end
end
