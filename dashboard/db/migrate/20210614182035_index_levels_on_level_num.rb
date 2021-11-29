class IndexLevelsOnLevelNum < ActiveRecord::Migration[5.2]
  def change
    add_index :levels, :level_num
  end
end
