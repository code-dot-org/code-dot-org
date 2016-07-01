class AddDeletedAtToSections < ActiveRecord::Migration
  def change
    add_column :sections, :deleted_at, :timestamp
  end
end
