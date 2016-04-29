class RemoveTypeFromPlcEnrollmentTaskAssignments < ActiveRecord::Migration
  def change
    remove_column :plc_enrollment_task_assignments, :type, :string
  end
end
