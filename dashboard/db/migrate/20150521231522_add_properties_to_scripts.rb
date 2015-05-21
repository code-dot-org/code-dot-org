class AddPropertiesToScripts < ActiveRecord::Migration
  def change
    add_column :scripts, :properties, :text
  end
end
