class AddScriptToUserLevels < ActiveRecord::Migration[4.2]
  def change
    # sql commands in comments for manual migration
    add_column :user_levels, :script_id, :integer, null: true
    # ALTER TABLE `user_levels` ADD `script_id` int(11)
    add_index :user_levels, [:user_id, :level_id, :script_id], unique: true
    # CREATE UNIQUE INDEX `index_user_levels_on_user_id_and_level_id_and_script_id` ON `user_levels` (`user_id`, `level_id`, `script_id`)
    remove_index :user_levels, column: [:user_id, :level_id], unique: true
    # DROP INDEX `index_user_levels_on_user_id_and_level_id` ON `user_levels`

    add_column :user_levels, :level_source_id, :integer, null: true
    # ALTER TABLE `user_levels` ADD `level_source_id` int(11)
  end
end
