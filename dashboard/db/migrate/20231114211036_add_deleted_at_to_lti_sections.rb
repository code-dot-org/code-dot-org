class AddDeletedAtToLtiSections < ActiveRecord::Migration[6.1]
  def change
    add_column :lti_sections, :deleted_at, :datetime
    add_index :lti_sections, :deleted_at
  end
end
