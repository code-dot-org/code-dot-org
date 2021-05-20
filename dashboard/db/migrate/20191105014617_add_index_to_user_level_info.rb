class AddIndexToUserLevelInfo < ActiveRecord::Migration[5.0]
  def change
    add_index :user_level_infos, :user_level_id, unique: true
  end
end
