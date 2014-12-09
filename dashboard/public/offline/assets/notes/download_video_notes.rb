require 'open-uri'
video_keys = %w(maze_intro loop_times loop_until if if_else_scrat)
video_keys.each do |key|
  open("#{key}.html", 'wb') do |file|
    file << open("http://0.0.0.0:3000/notes/#{key}").read
  end
end