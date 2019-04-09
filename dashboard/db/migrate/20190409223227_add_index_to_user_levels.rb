class AddIndexToUserLevels < ActiveRecord::Migration[5.0]
  def change
    add_index :user_levels, [:user_id, :script_id]
  end
end
