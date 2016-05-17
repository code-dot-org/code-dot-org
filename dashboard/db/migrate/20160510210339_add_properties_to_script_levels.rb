class AddPropertiesToScriptLevels < ActiveRecord::Migration
  def change
    add_column :script_levels, :properties, :text
  end
end
