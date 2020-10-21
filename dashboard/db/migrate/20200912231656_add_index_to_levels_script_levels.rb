class AddIndexToLevelsScriptLevels < ActiveRecord::Migration[5.0]
  def change
    add_index :levels_script_levels, [:script_level_id, :level_id], unique: true
  end
end
