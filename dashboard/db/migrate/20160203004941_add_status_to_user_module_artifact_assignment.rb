class AddStatusToUserModuleArtifactAssignment < ActiveRecord::Migration
  def change
    add_column :user_module_artifact_assignments, :status, :string
  end
end
