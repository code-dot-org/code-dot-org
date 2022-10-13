class CreateCodeReviews < ActiveRecord::Migration[6.0]
  def change
    create_table :code_reviews do |t|
      t.integer :user_id, null: false
      t.integer :project_id, null: false
      t.integer :script_id, null: false
      t.integer :level_id, null: false
      t.integer :project_level_id, null: false
      t.string :project_version, null: false
      t.datetime :project_version_expires_at
      t.integer :storage_id, null: false
      t.datetime :closed_at
      t.datetime :deleted_at

      t.timestamps

      t.index [:user_id, :project_id, :closed_at, :deleted_at],
        name: 'index_code_reviews_unique', unique: true
      t.index [:project_id, :deleted_at]
      t.index [:user_id, :script_id, :project_level_id, :closed_at, :deleted_at],
        name: 'index_code_reviews_for_peer_lookup'
    end
  end
end
