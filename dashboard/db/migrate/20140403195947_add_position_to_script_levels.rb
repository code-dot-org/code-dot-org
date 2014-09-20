class AddPositionToScriptLevels < ActiveRecord::Migration
  def change
    add_column :script_levels, :position, :integer
  end
end
