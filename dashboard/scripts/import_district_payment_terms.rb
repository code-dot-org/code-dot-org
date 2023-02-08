#!/usr/bin/env ruby
require_relative '../config/environment'
require 'csv'

COL_ID = 'NCES District/School ID'.freeze
COL_COURSE = 'Course Name'.freeze
COL_HOURLY = 'Hourly Rate'.freeze
COL_DAILY = 'Daily Rate'.freeze

COURSE_TRANSLATION = {
  'CSP' => Pd::Workshop::COURSE_CSP,
  'ECS' => Pd::Workshop::COURSE_ECS,
  'CSinA' => Pd::Workshop::COURSE_CS_IN_A,
  'CSinS' => Pd::Workshop::COURSE_CS_IN_S,
  'CSD' => Pd::Workshop::COURSE_CSD,
}.freeze

terms_csv = ARGV[0]
unless terms_csv
  puts 'Usage: import_district_payment_terms.rb district_payment_terms.csv'
  exit
end

class CSV::Row
  def [](header)
    raw_value = field header
    return nil unless raw_value
    raw_value.strip
  end
end

# @param raw_rate [String] Either 'N/A', blank, or a dollar amount.
# @return [Float] parsed dollar amount, or nil
def parse_rate(raw_rate)
  return nil if raw_rate.blank? || raw_rate == 'N/A'
  raw_rate.to_f
end

# First pass, validate the data.
term_list = []
CSV.foreach(terms_csv, headers: true) do |row|
  id = row[COL_ID]
  course_abbr = row[COL_COURSE]
  course = COURSE_TRANSLATION[course_abbr]
  hourly_rate = parse_rate row[COL_HOURLY]
  daily_rate = parse_rate row[COL_DAILY]

  raise "Unexpected course: #{course_abbr}" if course_abbr && !course

  next if id.blank? || id == 'NA'
  next unless hourly_rate || daily_rate

  # Verify school district id
  raise "Invalid school district id: #{id}" unless SchoolDistrict.exists? id

  if hourly_rate
    term_list << {
      school_district_id: id,
      course: course,
      rate_type: Pd::DistrictPaymentTerm::RATE_HOURLY,
      rate: hourly_rate
    }
  end

  if daily_rate
    term_list << {
      school_district_id: id,
      course: course,
      rate_type: Pd::DistrictPaymentTerm::RATE_DAILY,
      rate: daily_rate
    }
  end
end

puts "Creating / updating #{term_list.count} district payment terms..."
term_list.each do |params|
  Pd::DistrictPaymentTerm.find_or_create_by! params
end
