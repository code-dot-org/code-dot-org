class AddIsDemoToSections < ActiveRecord::Migration[7.0]
  def change
    add_column :sections, :is_demo, :boolean, default: false, null: false
  end
end
