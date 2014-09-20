#!/usr/bin/ruby

require 'csv'
require 'yaml'

code_string_pairs = Hash.new

CSV.foreach("#{ARGV[0]}", { headers: true }) do |row|
  code_string_pairs[row["code"]] = row["string"]
end

File.open("#{ARGV[1]}", 'w+') do |f|
  f.write(({ "en-US" => code_string_pairs }).to_yaml(options = {:line_width => -1}))
end

puts "#{ARGV[0]} => #{ARGV[1]}"
