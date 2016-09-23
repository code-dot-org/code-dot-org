class DropTableBlocks < ActiveRecord::Migration[4.2]
  def change
    drop_table :blocks
    drop_table :level_blocks
  end
end
