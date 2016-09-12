class AddIndexToUserScripts < ActiveRecord::Migration[4.2]
  def change
    add_index :user_scripts, :script_id
  end
end
