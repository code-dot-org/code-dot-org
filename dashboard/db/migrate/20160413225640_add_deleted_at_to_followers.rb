class AddDeletedAtToFollowers < ActiveRecord::Migration
  def change
    add_column :followers, :deleted_at, :timestamp
  end
end
