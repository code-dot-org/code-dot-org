ARGF.each do |line|
  # Determine whether the log is a GET or POST request, emitting the appropriate
  # key/value.
  if line.include? "GET"
    puts "GET" + "\t" + "1"
  end
  if line.include? "POST" 
    puts "POST" + "\t" + "1"
  end
end
