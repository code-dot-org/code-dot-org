class CodeReviewCommentsMakeProjectVersionNullable < ActiveRecord::Migration[5.2]
  def change
    change_column_null :code_review_comments, :project_version, true
  end
end
