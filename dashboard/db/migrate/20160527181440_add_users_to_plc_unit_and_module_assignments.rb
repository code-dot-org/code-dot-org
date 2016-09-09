class AddUsersToPlcUnitAndModuleAssignments < ActiveRecord::Migration[4.2]
  def change
    add_reference :plc_enrollment_unit_assignments, :user, index: true
    add_reference :plc_enrollment_module_assignments, :user, index: true
  end
end
