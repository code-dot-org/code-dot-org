#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'
require 'csv'

# Run using `ruby add_progress_v2_closed_beta_users.rb <path_to_csv>`
# For a given csv file, find all users by id and update their `progress_table_v2_closed_beta` user preference to true.

# CSV file must have a `id` column

teacher_id_csv = ARGV[0]
unless teacher_id_csv
  puts 'Usage: add_progress_v2_closed_beta_users <teacher_id_csv>'
  exit
end

count = 0
CSV.table(teacher_id_csv).each do |row|
  user = User.find(id: row[:id])
  if user.teacher?
    user.update!(progress_table_v2_closed_beta: true)
    count += 1
  end
end

puts "Added #{count} users to Progress closed beta"
