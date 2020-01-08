class RenameUserLevelInfosToValidatedUserLevels < ActiveRecord::Migration[5.0]
  def change
    remove_index :user_level_infos, :user_level_id
    rename_table :user_level_infos, :validated_user_levels
    add_index :validated_user_levels, :user_level_id, unique: true
  end
end
