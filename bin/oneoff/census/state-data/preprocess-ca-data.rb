#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'optparse'

CDO.log = Logger.new(STDERR)

filename = nil

OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-f', '--filename FILENAME', 'File containing the data to process') do |f|
    filename = f
  end
  opts.on('-h', '--help', 'Prints this help') do
    puts opts
    exit
  end
end.parse!

# The raw file we get from CA (CoursesTaught via https://www.cde.ca.gov/ds/sd/df/filesassign.asp)
# Has data for all courses in all schools in CA, not just CS.
# Rather than processing that huge file as part of seeding we just filter out the rows
# we care about. At the same time we convert it from TSV to CSV.
CSV($stdout) do |output|
  CDO.log.info "Opening #{filename}"
  input = CSV.open(filename, {headers: true, col_sep: "\t", encoding: 'ISO-8859-1:UTF-8'})
  # read in the headers
  input.readline
  output << input.headers
  input.each do |input_row|
    output << input_row if Census::StateCsOffering::CA_COURSE_CODES.include? input_row['CourseCode']
  end
end
