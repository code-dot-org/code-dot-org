class CreateProjectVersionMetadata < ActiveRecord::Migration[5.2]
  def change
    create_table :project_version_metadata do |t|
      t.string :storage_app_id, null: false
      t.string :object_version_id, null: false
      t.text :comment
      t.timestamps

      t.index [:storage_app_id]
    end

    reversible do |dir|
      dir.up do
        execute "ALTER TABLE project_version_metadata CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin"
      end
    end
  end
end
