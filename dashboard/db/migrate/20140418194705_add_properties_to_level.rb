class AddPropertiesToLevel < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :properties, :text
  end
end
