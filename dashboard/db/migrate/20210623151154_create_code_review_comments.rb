class CreateCodeReviewComments < ActiveRecord::Migration[5.2]
  def change
    create_table :code_review_comments do |t|
      t.integer :channel_token_id, null: false
      t.string :project_version
      t.integer :commenter_id, null: false
      t.text :comment
      t.integer :project_owner_id
      t.integer :section_id
      t.boolean :is_from_teacher
      t.boolean :is_resolved
      t.timestamp :deleted_at

      t.timestamps

      t.index [:channel_token_id, :project_version],
        name: 'index_code_review_comments_on_project_id_and_version'
    end

    reversible do |dir|
      dir.up do
        execute "ALTER TABLE code_review_comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin"
      end
    end
  end
end
