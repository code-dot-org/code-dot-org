class AllowNullCodeReviewNoteComment < ActiveRecord::Migration[6.0]
  def up
    change_column :code_review_notes, :comment, :text, size: :medium, null: true
  end

  def down
    change_column :code_review_notes, :comment, :text, size: :medium, null: false
  end
end
