#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'optparse'

CDO.log = Logger.new(STDERR)

options = {
  state: nil,
  school_year: nil,
}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-s', '--state STATE_ABBREVIATION', 'Two letter state abbreviation') do |s|
    options[:state] = s
  end
  opts.on('-y', '--school_year YEAR', 'The school year for the data. This should be the calendar year in which the school year began (e.g., 2017 for the 2017-2018 school year)') do |y|
    options[:school_year] = y
  end
  opts.on('-h', '--help', 'Prints this help') do
    puts opts
    exit
  end
end.parse!

missing_args = [:state, :school_year].select {|arg| options[arg].nil?}
raise OptionParser::MissingArgument.new(missing_args.join(', ')) unless missing_args.empty?
raise OptionParser::InvalidOption.new("State code must be a two-character US state code") unless us_state_abbr?(options[:state], true)
raise OptionParser::InvalidOption.new("School year must be four digits") unless options[:school_year] =~ /^\d{4}$/

state_code = options[:state].upcase
school_year = options[:school_year].to_i
bucket_name = Census::StateCsOffering::CENSUS_BUCKET_NAME
object_key = Census::StateCsOffering.construct_object_key(state_code, school_year)

ActiveRecord::Base.transaction do
  pattern = "#{state_code}-%"
  num_deleted = Census::StateCsOffering.where(school_year: school_year).where("state_school_id LIKE ?", pattern).delete_all
  CDO.log.info "Deleted #{num_deleted} StateCsOfferings with state_school_id matching '#{pattern}' and school_year #{school_year}"
  num_deleted = SeededS3Object.where(bucket: bucket_name, key: object_key).delete_all
  CDO.log.info "Deleted #{num_deleted} rows from seeded_s3_objects for bucket: '#{bucket_name}', key: '#{object_key}'"
  Census::StateCsOffering.seed
end
