#!/usr/bin/env ruby

# This script updates all maze levels that are configured to
# only show the run button to also show the step button

require_relative '../config/environment'

puts "Starting"

mazes = Level.all.select { |x| x.is_a? Maze }
mazes_without_step = mazes.select{|x| x.step_mode == 0}
puts "Found #{mazes_without_step.length} levels to update"

mazes_without_step.each do |m|
  m.step_mode = 1
  m.save()
end
puts "Done"
