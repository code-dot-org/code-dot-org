class AddMazeToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :maze, :string, limit: 20000
  end
end
