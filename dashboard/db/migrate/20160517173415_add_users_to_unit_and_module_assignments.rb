class AddUsersToUnitAndModuleAssignments < ActiveRecord::Migration
  def change
    add_reference :plc_enrollment_unit_assignments, :user, index: true
    add_reference :plc_enrollment_module_assignments, :user, index: true

    Plc::EnrollmentUnitAssignment.all.each do |unit_assignment|
      unit_assignment.update(user: unit_assignment.plc_user_course_enrollment.user)
    end
    change_column_null :plc_enrollment_unit_assignments, :user_id, false

    Plc::EnrollmentModuleAssignment.all.each do |module_assignment|
      module_assignment.update(user: module_assignment.plc_enrollment_unit_assignment.user)
    end
    change_column_null :plc_enrollment_module_assignments, :user_id, false
  end
end
