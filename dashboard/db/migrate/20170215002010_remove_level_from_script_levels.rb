class RemoveLevelFromScriptLevels < ActiveRecord::Migration[5.0]
  def change
    remove_column :script_levels, :level_id, :integer
  end
end
