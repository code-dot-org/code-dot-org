class CreateProjectStateAndStorageIdIndex < ActiveRecord::Migration[6.0]
  def up
    add_index :projects, [:storage_id, :state], name: "storage_apps_storage_id_state_index"
  end

  def down
    remove_index :projects, [:storage_id, :state]
  end
end
