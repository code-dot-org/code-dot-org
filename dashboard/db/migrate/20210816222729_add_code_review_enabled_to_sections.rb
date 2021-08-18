class AddCodeReviewEnabledToSections < ActiveRecord::Migration[5.2]
  def up
    add_column :sections, :code_review_enabled, :boolean
  end

  def down
    remove_column :sections, :code_review_enabled
  end
end
