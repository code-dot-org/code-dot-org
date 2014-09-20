class AddPropertiesToLevel < ActiveRecord::Migration
  def change
    add_column :levels, :properties, :text
  end
end
