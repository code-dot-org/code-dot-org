#!/usr/bin/env ruby

# utility to convert usernames to user_ids in a CSV file, since this is the
# format we sometimes get receive in zendesk. we do not want to commit the
# usernames to git due to privacy, but we do want a record of which users we
# deleted progress for, so we convert them to user_ids before committing.
#
# intended usage:
# 1. copy the username CSV file to production-console via gateway using scp
# 2. run this script on production-console
# 3. check that the resulting file contains user ids and not usernames
# 4. run the progress deletion request against the -user-ids.csv file
# 5. copy the -user_ids.csv file back to your local machine and commit it to git

if ARGV.length != 1
  puts "Usage: #{File.basename(__FILE__)} yyyy-mm-dd-users.csv"
  puts 'The CSV needs a column with "student_username".'
  puts 'It will output another CSV file with "student_id" replacing "student_username".'
  puts 'If present, the "unit_name" column will be preserved.'
  exit 1
end

require_relative '../../../dashboard/config/environment'
require 'csv'

csv_file_path = ARGV[0]
rows = CSV.read(csv_file_path, headers: true)
rows = rows.map do |row|
  unless row['student_username']
    puts 'CSV must have a column named "student_username".'
    exit 1
  end
  user = User.find_by_username(row['student_username'])
  raise("Student with username #{row['student_username']} not found") unless user
  {student_id: user.id, unit_name: row['unit_name']}.compact
end
headers = rows.first.keys

output_csv_file_path = csv_file_path.sub(/\.csv\z/, '-user-ids.csv')
CSV.open(output_csv_file_path, 'w', headers: headers, write_headers: true) do |csv|
  rows.each do |row|
    csv << row
  end
end
