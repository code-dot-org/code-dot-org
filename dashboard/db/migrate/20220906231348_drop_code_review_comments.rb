class DropCodeReviewComments < ActiveRecord::Migration[6.0]
  def change
    drop_table :code_review_comments
  end
end
