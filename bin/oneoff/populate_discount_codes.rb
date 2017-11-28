# This script parses a CSV file of discount codes, and uses it to populate our
# db. The CSV file(s) should not be checked into our repo as they contain secrets.
# The file(s) are expected to have the following format:
# 1 header row
# 1 row for each entry, where a row contains a prefix column and a code column
# The full code is prefix + code
require 'securerandom'
require 'csv'
require_relative '../../dashboard/config/environment'
require src_dir 'database'

# @param {boolean} full_discount - Is this a full or partial discount?
# @param {number} n - How many entries to crate
def populate_fake_data(n, full_discount, expiration)
  n.times do
    # Create a bogus code
    prefix = full_discount ? 'FAKE0_' : 'FAKE100_'
    code = SecureRandom.hex(7)
    CircuitPlaygroundDiscountCode.create!(
      code: prefix + code,
      full_discount: full_discount,
      expiration: expiration
    )
  end
end

def populate_csv_data(filename, full_discount, expiration)
  csv_contents = CSV.read(filename)
  # skip header row
  csv_contents.shift
  csv_contents.each do |line|
    prefix, code = line
    CircuitPlaygroundDiscountCode.create!(
      code: prefix + code,
      full_discount: full_discount,
      expiration: expiration
    )
  end
end

full_discount = ARGV[0]
filename_or_n = ARGV[1]

unless full_discount && filename_or_n
  puts 'Expected usage: '
  puts 'populate_discount_codes <full_discount?> <path_to_csv_file> # real data'
  puts 'populate_discount_codes <full_discount?> <n> # fake data'
  exit(-1)
end

if full_discount == 'true'
  full_discount = true
elsif full_discount == 'false'
  full_discount = false
else
  puts 'first argument must be true or false'
  exit(-1)
end

n = Integer(filename_or_n) rescue false
if n
  # If we're passed a number, just populate fake data
  puts "Populating fake data: #{filename_or_n} codes with full_discount=#{full_discount}"
  populate_fake_data(n, full_discount, Date.new(2018, 12, 31))
else
  # If we're passed a filename, parse the CSV and populate
  puts "Reading #{filename_or_n}"
  populate_csv_data(filename_or_n, full_discount, Date.new(2018, 12, 31))
end

puts 'Complete'
