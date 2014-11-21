class AddScriptToUserLevelsAndActivities < ActiveRecord::Migration
  def change
    add_column :activities, :script_id, :integer, null: true
    add_index :activities, [:user_id, :level_id, :script_id]
    remove_index :activities, [:user_id, :level_id]

    add_column :user_levels, :script_id, :integer, null: true
    add_index :user_levels, [:user_id, :level_id, :script_id], unique: true
    remove_index :user_levels, [:user_id, :level_id]
  end
end
