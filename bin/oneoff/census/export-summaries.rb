#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'
require 'optparse'

CDO.log = Logger.new(STDOUT)

filename = "census-summaries.csv"

OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-f', '--filename FILENAME', 'Exports to this file (default: census-summaries.csv)') do |f|
    filename = f
  end
  opts.on('-h', '--help', 'Prints this help') do
    puts opts
    exit
  end
end.parse!

#CDO.log.info "Called with options: #{options}"

CDO.log.info "Exporting to: #{filename}"
cols = %w(school_id school_year teaches_cs audit_data)
CSV.open(filename, 'w') do |csv|
  csv << cols
  Census::CensusSummary.order(:school_year, :school_id).find_each do |summary|
    csv << cols.map {|col| summary[col]}
  end
end
CDO.log.info "Exported to: #{filename}"
