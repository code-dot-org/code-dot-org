#!/usr/bin/ruby

ARGF.each do |line|
  # Determine whether the log is a GET or POST request, emitting the appropriate
  # key/value.
  if line && (line.include? "GET")
    puts "GET" + "\t" + "1"
  elsif line.include? "POST"
    puts "POST" + "\t" + "1"
  else
    puts "OTHER" + "\t" + "1"
  end
end
