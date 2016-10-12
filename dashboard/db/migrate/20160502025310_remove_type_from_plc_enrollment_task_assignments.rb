class RemoveTypeFromPlcEnrollmentTaskAssignments < ActiveRecord::Migration[4.2]
  def change
    remove_column :plc_enrollment_task_assignments, :type, :string
  end
end
