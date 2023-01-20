#!/usr/bin/ruby

require 'csv'
require 'yaml'

code_string_pairs = Hash.new

CSV.foreach(ARGV[0], {headers: true}) do |row|
  code_string_pairs[row["code"]] = row["string"]
end

File.write(ARGV[1], ({"en-US" => code_string_pairs}).to_yaml(line_width: -1))

puts "#{ARGV[0]} => #{ARGV[1]}"
