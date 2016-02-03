class AddUserToUserEnrollmentModuleAssignment < ActiveRecord::Migration
  def change
    add_reference :user_enrollment_module_assignments, :user, index: true, foreign_key: true
  end
end
