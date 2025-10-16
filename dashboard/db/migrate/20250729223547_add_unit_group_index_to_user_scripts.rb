class AddUnitGroupIndexToUserScripts < ActiveRecord::Migration[6.1]
  NEW_INDEX_NAME = 'index_user_scripts_on_user_script_unit_group_deleted_unique'
  OLD_INDEX_NAME = 'index_user_scripts_on_user_id_and_script_id_and_deleted_at'

  def up
    # Skip production because the database migration will be done manually.
    return if Rails.env.production?

    add_index :user_scripts, [:user_id, :script_id, :unit_group_id, :deleted_at], unique: true, name: NEW_INDEX_NAME
    remove_index :user_scripts, name: OLD_INDEX_NAME
  end

  def down
    return if Rails.env.production?

    add_index :user_scripts, [:user_id, :script_id, :deleted_at], unique: true, name: OLD_INDEX_NAME
    remove_index :user_scripts, name: NEW_INDEX_NAME
  end
end
