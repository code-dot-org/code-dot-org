class FixFarmerLevels < ActiveRecord::Migration
  def self.up
    Karel.all.each do |level|
      maze = level.properties["maze"]
      dirt = level.properties["initial_dirt"]
      maze = JSON.parse(maze) if maze.is_a? String
      dirt = JSON.parse(dirt) if dirt.is_a? String
      maze.each_with_index do |row, y|
        row.each_with_index do |_, x|
          maze[y][x] = 1 if dirt[y][x] != 0 && maze[y][x] == 0
          dirt[y][x] -= 100 if dirt[y][x] > 50
        end
      end
      level.properties["maze"] = maze
      level.properties["initial_dirt"] = dirt
      level.save
    end
  end
end
