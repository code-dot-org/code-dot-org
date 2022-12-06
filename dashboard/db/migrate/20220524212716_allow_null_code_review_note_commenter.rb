class AllowNullCodeReviewNoteCommenter < ActiveRecord::Migration[6.0]
  def up
    change_column :code_review_notes, :commenter_id, :integer, null: true
  end

  def down
    change_column :code_review_notes, :commenter_id, :integer, null: false
  end
end
