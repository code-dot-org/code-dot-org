class AddPositionToScriptLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :script_levels, :position, :integer
  end
end
