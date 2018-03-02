#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'
require 'optparse'

CDO.log = Logger.new(STDOUT)

algorithm = :summarize_school_data_naive_bayes

OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-a', '--algorithm ALGORITHM_NAME', 'Summarizarion algorithm to use: (summarize_school_data_naive_bayes or summarize_school_data_simple)') do |a|
    algorithm = a.to_sym
  end
  opts.on('-h', '--help', 'Prints this help') do
    puts opts
    exit
  end
end.parse!

cols = %w(school_id school_year teaches_cs audit_data)
CSV($stdout) do |csv|
  csv << cols
  Census::CensusSummary.summarize_census_data(algorithm.to_proc) do |summary|
    csv << cols.map {|col| summary[col]}
  end
end
