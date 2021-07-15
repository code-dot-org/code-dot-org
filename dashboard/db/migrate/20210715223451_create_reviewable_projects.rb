class CreateReviewableProjects < ActiveRecord::Migration[5.2]
  def change
    create_table :reviewable_projects do |t|
      t.integer :storage_app_id, null: false
      t.integer :user_id, null: false
      t.integer :level_id, null: false
      t.integer :script_id, null: false

      t.timestamps

      t.index [:storage_app_id, :user_id],
        name: 'index_reviewable_projects_on_storage_app_id_and_user_id'
    end

    reversible do |dir|
      dir.up do
        execute "ALTER TABLE reviewable_projects CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin"
      end
    end
  end
end
