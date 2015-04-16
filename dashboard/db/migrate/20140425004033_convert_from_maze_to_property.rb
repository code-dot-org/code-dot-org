class ConvertFromMazeToProperty < ActiveRecord::Migration
  def change
    Level.all.each do |level|
      unless level.maze.nil?
        level.properties.update(maze: JSON.parse(level.maze))
        level.maze = nil
        level.save!
      end
    end
  end
end
