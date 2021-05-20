class UpdateUserLevelsInfo < ActiveRecord::Migration[5.0]
  def change
    remove_index :user_level_infos, :user_level_id
  end
end
