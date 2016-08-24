class AddDeletedAtToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :deleted_at, :datetime
    add_index :users, :deleted_at
  end
end
