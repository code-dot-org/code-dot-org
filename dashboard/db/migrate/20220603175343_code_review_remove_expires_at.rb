class CodeReviewRemoveExpiresAt < ActiveRecord::Migration[6.0]
  def change
    remove_column :code_reviews, :project_version_expires_at
  end
end
