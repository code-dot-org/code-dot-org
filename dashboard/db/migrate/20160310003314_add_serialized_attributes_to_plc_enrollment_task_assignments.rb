class AddSerializedAttributesToPlcEnrollmentTaskAssignments < ActiveRecord::Migration[4.2]
  def change
    add_column :plc_enrollment_task_assignments, :type, :string
    add_column :plc_enrollment_task_assignments, :properties, :text
  end
end
