class DropPlcEnrollmentTaskAssignments < ActiveRecord::Migration
  def change
    drop_table :plc_enrollment_task_assignments
  end
end
