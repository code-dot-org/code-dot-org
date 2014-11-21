class AddScriptToUserLevels < ActiveRecord::Migration
  def change
    add_column :user_levels, :script_id, :integer, null: true
    add_index :user_levels, [:user_id, :level_id, :script_id], unique: true
    remove_index :user_levels, column: [:user_id, :level_id]
  end
end
