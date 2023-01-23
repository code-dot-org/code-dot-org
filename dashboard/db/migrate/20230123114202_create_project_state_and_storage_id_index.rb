class CreateProjectStateAndStorageIdIndex < ActiveRecord::Migration[6.0]
  def up
    add_index :projects, [:storage_id, :state], name: "index_project_on_storage_id_and_state"
  end

  def down
    remove_index :projects, [:storage_id, :state]
  end
end
