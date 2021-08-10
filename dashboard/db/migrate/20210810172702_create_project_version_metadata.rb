class CreateProjectVersionMetadata < ActiveRecord::Migration[5.2]
  def change
    create_table :project_version_metadata do |t|
      t.integer :storage_app_id, null: false
      t.string :object_version_id, null: false
      t.text :comment
      t.timestamps

      t.index [:storage_app_id]
      t.index [:storage_app_id, :object_version_id], name: 'index_project_version_metadata_on_storage_app_id_and_version_id', unique: true
    end

    reversible do |dir|
      dir.up do
        execute "ALTER TABLE project_version_metadata CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin"
      end
    end
  end
end
