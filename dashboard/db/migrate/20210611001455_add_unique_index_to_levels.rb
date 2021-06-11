class AddUniqueIndexToLevels < ActiveRecord::Migration[5.2]
  def change
    add_index :levels, [:name, :game_id, :level_num], unique: true
  end
end
