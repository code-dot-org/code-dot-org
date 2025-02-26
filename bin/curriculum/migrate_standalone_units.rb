#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'optparse'

# This script is used to convert standalone courses to UnitGroups.
options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: migrate_standalone_units.rb [options]"

  opts.on("--verbose", "Run verbosely") do
    options[:verbose] = true
  end

  opts.on("-l", "--log-file [LOG_FILE]", "Specify a log file") do |log_file|
    options[:log_file] = log_file
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

def main(log_file: nil, verbose: false)
  # Temporarily disable readonly attributes and skip some checks in UnitGroup.update_scripts
  ENV['MIGRATE_STANDALONE_UNITS'] = 'true'

  # Find all standalone courses
  result = true
  init_standalone_courses = Unit.all.filter(&:is_course?)
  init_count = init_standalone_courses.count
  init_standalone_courses.each do |standalone_unit|
    result = Services::StandaloneUnitMigrator.call(standalone_unit, verbose: verbose, log_file: log_file) && result
  end

  puts "Units Converted: #{init_count - Unit.all.count(&:is_course?)}"
  puts "There was an issue with the migration. View the log for more information." unless result
  puts "Log File: #{File.expand_path(log_file)}" if log_file && (verbose || !result)

  # Restore readonly attributes and resume checks
  ENV.delete('MIGRATE_STANDALONE_UNITS')
end

main(log_file: options[:log_file], verbose: options[:verbose])
