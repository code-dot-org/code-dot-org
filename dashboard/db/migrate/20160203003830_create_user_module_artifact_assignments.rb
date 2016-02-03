class CreateUserModuleArtifactAssignments < ActiveRecord::Migration
  def change
    create_table :user_module_artifact_assignments do |t|
      t.references :artifact, index: true, foreign_key: true
      t.references :user_enrollment_module_assignment, foreign_key: true

      t.timestamps null: false
    end
  end
end
