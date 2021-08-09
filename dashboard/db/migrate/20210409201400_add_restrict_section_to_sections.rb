class AddRestrictSectionToSections < ActiveRecord::Migration[5.2]
  def change
    add_column :sections, :restrict_section, :boolean, default: false
  end
end
