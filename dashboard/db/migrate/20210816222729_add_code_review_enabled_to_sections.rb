class AddCodeReviewEnabledToSections < ActiveRecord::Migration[5.2]
  def up
    add_column :sections, :code_review_enabled, :boolean
    Section.reset_column_information
    Section.update_all(code_review_enabled: true)
  end

  def down
    remove_column :sections, :code_review_enabled
  end
end
