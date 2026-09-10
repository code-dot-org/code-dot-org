class AddAnonUserIdToUserProjectStorageIds < ActiveRecord::Migration[7.0]
  def change
    add_column :user_project_storage_ids, :anon_user_id, :string, limit: 36
  end
end
