class AddPropertiesToSection < ActiveRecord::Migration[5.2]
  def change
    add_column :sections, :properties, :text
  end
end
