class IndexLevelsOnType < ActiveRecord::Migration[6.1]
  def change
    add_index :levels, :type
  end
end
