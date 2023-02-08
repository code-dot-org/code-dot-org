class CreateCodeReviewRequests < ActiveRecord::Migration[6.0]
  def change
    create_table :code_review_requests do |t|
      t.integer :user_id, null: false
      t.integer :script_id, null: false
      t.integer :level_id, null: false
      t.integer :project_id, null: false
      t.string :project_version, null: false
      t.datetime :closed_at
      t.datetime :deleted_at

      t.timestamps

      t.index [:user_id, :script_id, :level_id, :closed_at, :deleted_at],
        name: 'index_code_review_requests_unique', unique: true
    end
  end
end
