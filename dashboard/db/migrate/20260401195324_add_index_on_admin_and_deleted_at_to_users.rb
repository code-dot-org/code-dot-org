class AddIndexOnAdminAndDeletedAtToUsers < ActiveRecord::Migration[7.0]
  def change
    add_index :users, [:admin, :deleted_at]
  end
end
