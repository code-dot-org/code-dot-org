class RenameCodeReviewCommentColumn < ActiveRecord::Migration[6.0]
  def change
    rename_column :code_review_comments, :code_review_request_id, :code_review_id
  end
end
