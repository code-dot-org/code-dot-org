class AddModuleEnrollmentToArtifactAssignment < ActiveRecord::Migration
  def change
    add_reference :artifact_assignments, :user_enrollment_module_assignment, foreign_key: true
  end
end
