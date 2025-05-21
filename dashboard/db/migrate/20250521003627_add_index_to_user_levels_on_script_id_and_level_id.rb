class AddIndexToUserLevelsOnScriptIdAndLevelId < ActiveRecord::Migration[6.1]
  def change
    add_index :user_levels, [:script_id, :level_id], name: 'index_user_levels_on_script_and_level'
  end
end
