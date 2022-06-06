class CodeReviewRemoveExpiresAt < ActiveRecord::Migration[6.0]
  def up
    remove_column :code_reviews, :project_version_expires_at
  end

  def down
    add_column :code_reviews, :project_version_expires_at, :datetime
  end
end
