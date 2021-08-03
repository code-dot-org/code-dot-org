class AddDeletedAtToLevels < ActiveRecord::Migration[5.2]
  def change
    add_column :levels, :deleted_at, :datetime
    add_index :levels, :deleted_at
  end
end
