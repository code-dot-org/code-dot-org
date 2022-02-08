class UpdateBackpackIndices < ActiveRecord::Migration[5.2]
  def change
    remove_index :backpacks, :user_id
    add_index :backpacks, :user_id, unique: true
    add_index :backpacks, :storage_app_id, unique: true
  end
end
