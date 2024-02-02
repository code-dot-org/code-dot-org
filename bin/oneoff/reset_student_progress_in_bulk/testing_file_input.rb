#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

require 'csv'

csv_file_path = '/Users/kaitlynobryan/Documents/GitHub/code-dot-org/bin/oneoff/reset_student_progress_in_bulk/testing_usernames.csv'

usernames = CSV.read(csv_file_path, headers: true).map {|row| row['username']}

puts usernames
