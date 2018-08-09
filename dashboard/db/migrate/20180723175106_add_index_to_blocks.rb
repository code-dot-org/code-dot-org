class AddIndexToBlocks < ActiveRecord::Migration[5.0]
  def change
    change_column_null :blocks, :name, false
    change_column_null :blocks, :pool, false
    add_index :blocks, [:pool, :name], unique: true
    add_index :blocks, :deleted_at
  end
end
