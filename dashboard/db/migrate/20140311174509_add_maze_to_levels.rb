class AddMazeToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :maze, :string, limit: 20000
  end
end
