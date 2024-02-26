#!/usr/bin/env ruby
require_relative('../config/environment')
require 'csv'

# Run using `ruby add_progress_v2_closed_beta_users.rb <path_to_csv>`
# For a given csv file, find all users by email and update their `progress_table_v2_closed_beta` user preference to true.

# CSV file must have a `email` column

email_csv = ARGV[0]
unless email_csv
  puts 'Usage: add_progress_v2_closed_beta_users <email_csv>'
  exit
end

CSV.table(email_csv).each do |row|
  User.where(email: row[:email]).map {|u| u.update!(progress_table_v2_closed_beta: true)}
end
