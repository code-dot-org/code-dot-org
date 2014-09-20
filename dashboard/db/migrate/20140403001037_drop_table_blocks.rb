class DropTableBlocks < ActiveRecord::Migration
  def change
    drop_table :blocks
    drop_table :level_blocks
  end
end
