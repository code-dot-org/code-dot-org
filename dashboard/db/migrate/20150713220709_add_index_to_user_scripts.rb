class AddIndexToUserScripts < ActiveRecord::Migration
  def change
    add_index :user_scripts, :script_id
  end
end
