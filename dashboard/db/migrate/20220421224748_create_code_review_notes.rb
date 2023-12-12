class CreateCodeReviewNotes < ActiveRecord::Migration[6.0]
  def change
    create_table :code_review_notes do |t|
      t.integer :code_review_request_id, null: false
      t.integer :commenter_id, null: false
      t.boolean :is_resolved, null: false
      t.text :comment, null: false
      t.datetime :deleted_at

      t.timestamps

      t.index [:code_review_request_id]
    end

    reversible do |dir|
      dir.up do
        execute "ALTER TABLE code_review_notes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci"
      end
    end
  end
end
foo
