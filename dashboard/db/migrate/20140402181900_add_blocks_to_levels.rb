class AddBlocksToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :start_blocks, :text
    add_column :levels, :toolbox_blocks, :text
  end
end
