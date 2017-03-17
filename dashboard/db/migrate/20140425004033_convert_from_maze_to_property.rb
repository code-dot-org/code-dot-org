class ConvertFromMazeToProperty < ActiveRecord::Migration[4.2]
  def change
    Level.all.each do |level|
      next if level.maze.nil?
      level.properties.update(maze: JSON.parse(level.maze))
      level.maze = nil
      level.save!
    end
  end
end
