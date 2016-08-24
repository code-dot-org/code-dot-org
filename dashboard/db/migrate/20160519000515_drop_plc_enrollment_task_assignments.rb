class DropPlcEnrollmentTaskAssignments < ActiveRecord::Migration[4.2]
  def up
    drop_table :plc_enrollment_task_assignments
  end

  def down
    create_table :plc_enrollment_task_assignments do |t|
      t.string :status
      t.references :plc_enrollment_module_assignment, index: {name: 'task_assignment_module_assignment_index'}
      t.references :plc_task, index: {name: 'task_assignment_task_index'}

      t.timestamps null: false
    end
  end
end
