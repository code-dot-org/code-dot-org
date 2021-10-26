class AddCodeReviewExpiresAtToSections < ActiveRecord::Migration[5.2]
  def change
    add_column :sections, :code_review_expires_at, :timestamp
  end
end
