class AddPurgedAtToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :purged_at, :datetime, default: nil, after: :deleted_at
    add_index :users, :purged_at
  end
end
