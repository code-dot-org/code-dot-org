class AddDeletedAtToFollowers < ActiveRecord::Migration[4.2]
  def change
    add_column :followers, :deleted_at, :timestamp
  end
end
