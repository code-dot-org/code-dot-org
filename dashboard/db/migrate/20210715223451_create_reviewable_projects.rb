class CreateReviewableProjects < ActiveRecord::Migration[5.2]
  def change
    create_table :reviewable_projects do |t|
      t.integer :storage_app_id, null: false
      t.integer :user_id, null: false
      t.integer :level_id
      t.integer :script_id

      t.timestamps

      t.index [:storage_app_id, :user_id],
        name: 'index_reviewable_projects_on_storage_app_id_and_user_id'
    end
  end
end
