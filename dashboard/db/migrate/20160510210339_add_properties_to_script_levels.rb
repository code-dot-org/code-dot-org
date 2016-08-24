class AddPropertiesToScriptLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :script_levels, :properties, :text
  end
end
