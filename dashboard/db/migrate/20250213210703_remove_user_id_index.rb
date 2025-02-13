class RemoveUserIdIndex < ActiveRecord::Migration[6.1]
  def change
    remove_index :backpacks, name: "index_backpacks_on_user_id"
  end
end
