class AddBlocksToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :start_blocks, :text
    add_column :levels, :toolbox_blocks, :text
  end
end
