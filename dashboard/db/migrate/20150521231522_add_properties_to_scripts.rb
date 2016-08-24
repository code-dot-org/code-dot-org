class AddPropertiesToScripts < ActiveRecord::Migration[4.2]
  def change
    add_column :scripts, :properties, :text
  end
end
