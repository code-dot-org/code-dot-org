class DeleteCodeReviewEnabledColumnFromSections < ActiveRecord::Migration[5.2]
  def change
    remove_column :sections, :code_review_enabled, :boolean, default: true
  end
end
