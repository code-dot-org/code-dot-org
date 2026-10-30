class RemoveUserIdIndex < ActiveRecord::Migration[6.1]
  def change
    remove_index :backpacks, name: "index_backpacks_on_user_id"
    add_index :backpacks, [:user_id, :game_id], unique: true
  end
end
