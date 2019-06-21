class AddScriptIdToActivities < ActiveRecord::Migration[5.0]
  def change
    add_column :activities, :script_id, :integer
    add_index :activities, [:user_id, :level_id, :script_id]
    remove_index :activities, [:user_id, :level_id]
  end
end
