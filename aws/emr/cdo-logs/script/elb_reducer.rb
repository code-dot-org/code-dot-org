#!/usr/bin/ruby

get_count = 0
post_count = 0
other_count = 0

ARGF.each do |line|
  # Split input (on tab character) into key ("GET" or "POST") and value (count).
  (key, value) = line.chomp.split(/\t/)

  # Add the count for this key.
  if key == "GET"
    get_count += value.to_i
  elsif key == "POST"
    post_count += value.to_i
  else
    other_count += value.to_i
  end
end

puts "GET" + "\t" + get_count.to_s
puts "POST" + "\t" + post_count.to_s
puts "OTHER" + "\t" + other_count.to_s
