#!/usr/bin/env ruby

require 'optparse'

MIGRATED_UNITS_LOG = 'migrated_units.log'
$verbose = false

# This script is used to convert standalone courses to UnitGroups.
def parse_options
  options = {
    rollback: false,
    file_system_changes: true
  }

  OptionParser.new do |opts|
    opts.banner = "Usage: migrate_standalone_units.rb [options]"

    opts.on("-u", "--unit_names UnitName1,UnitName2", Array, "Unit names to migrate or rollback") do |unit_names|
      options[:unit_names] = unit_names
    end

    opts.on("-f", "--unit-names-file UNIT_NAMES_FILE", String, "File containing unit names to migrate or rollback. Each line should contain a single unit name.") do |unit_names_file|
      options[:unit_names_file] = unit_names_file
    end

    opts.on("-a", "--all", "Migrate all standalone units") do
      options[:all] = true
    end

    opts.on("-l", "--log-file LOG_FILE", String, "Specify a log file") do |log_file|
      options[:log_file] = log_file
    end

    opts.on("-r", "--rollback", "Rollback migration of specified units") do
      options[:rollback] = true
    end

    opts.on("--no-fs-changes", "Don't perform file system changes") do
      options[:file_system_changes] = false
    end

    opts.on("-v", "--verbose", "Use verbose debug logging ") do
      $verbose = true
    end

    opts.on("-h", "--help", "Prints this help") do
      puts opts
      exit
    end
  end.parse!

  raise "Unit names must be specified for rollback" if options[:rollback] && options[:unit_names].nil? && options[:unit_names_file].nil?
  raise "Unit names or 'all' is required. Use -h for options." if options[:unit_names].nil? && options[:unit_names_file].nil? && !options[:all]
  raise "Only one of 'unit_names', 'unit_names_file', or 'all' can be specified" if [options[:unit_names], options[:unit_names_file], options[:all]].compact.count > 1
  options
end

def require_rails_env
  puts "loading rails environment..." if $verbose
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  puts "rails environment loaded in #{(Time.now - start_time).to_i} seconds." if $verbose
end

def main(options)
  # Make sure environment variable is set to allow migration
  unless ENV.fetch('MIGRATE_STANDALONE_UNITS')
    puts "MIGRATE_STANDALONE_UNITS is not set"
    return
  end

  # Clear the log file
  if options[:log_file]
    FileUtils.rm_f(options[:log_file])
  end

  if options[:rollback]
    rollback_units(options)
    return
  end

  migrate_units(options)
end

def migrate_units(options)
  # Find all standalone courses
  all_successful = true
  migrated_units = []
  log_file = options[:log_file]

  if options[:all]
    standalone_units = Unit.all.filter(&:is_course?)
  elsif options[:unit_names]
    standalone_units = Unit.where(name: options[:unit_names])
  elsif options[:unit_names_file]
    standalone_units = File.read(options[:unit_names_file]).split("\n").filter_map do |unit_name|
      unit = Unit.find_by(name: unit_name)
      puts "Unit not found: #{unit_name}" if unit.nil?
      unit
    end
  else
    raise "No units specified"
  end

  standalone_units.each do |unit|
    begin
      result = Services::StandaloneUnitMigrator.call(unit, verbose: $verbose, log_file: log_file, file_system_changes: options[:file_system_changes])
    rescue Exception => exception
      filtered_backtrace = exception.backtrace.select {|line| line.include?("standalone_unit_migrator.rb")}
      puts "ERROR: Caught an exception while migrating #{unit.name}: #{exception.class} - #{exception.message}\n\tBacktrace: #{filtered_backtrace}"
    end
    migrated_units << unit.name if result
    all_successful &&= result
  end

  File.write(MIGRATED_UNITS_LOG, migrated_units.join("\n")) unless migrated_units.empty?
  puts "Units Migrated: #{migrated_units.count}"
  puts "There are still unmigrated units! Unmigrated Units: #{Unit.all.count(&:is_course?)}" if Unit.all.count(&:is_course?) > 0
  puts "View migrated units here: #{File.expand_path(MIGRATED_UNITS_LOG)}" unless migrated_units.empty?
  puts "There was an issue with the migration. View the log for more information." unless all_successful
  puts "Log File: #{File.expand_path(log_file)}" if log_file
end

def rollback_units(options)
  all_successful = true
  successful_rollback_count = 0
  log_file = options[:log_file]

  if options[:unit_names]
    units = Unit.where(name: options[:unit_names])
  elsif options[:unit_names_file]
    units = File.read(options[:unit_names_file]).split("\n").filter_map do |unit_name|
      unit = Unit.find_by(name: unit_name)
      puts "Unit not found: #{unit_name}" if unit.nil?
      unit
    end
  else
    raise "No units specified"
  end

  units.each do |unit|
    begin
      result = Services::StandaloneUnitMigrator.rollback(unit, verbose: $verbose, log_file: log_file, file_system_changes: options[:file_system_changes])
    rescue Exception => exception
      filtered_backtrace = exception.backtrace.select {|line| line.include?("standalone_unit_migrator.rb")}
      puts "ERROR: Caught an exception while rolling back #{unit.name}: #{exception.class} - #{exception.message}\n\tBacktrace: #{filtered_backtrace}"
    end
    successful_rollback_count += 1 if result
    all_successful &&= result
  end

  puts "Units Rolled Back: #{successful_rollback_count}"
  puts "There was an issue with the rollback. View the log for more information." unless all_successful
  puts "Log File: #{File.expand_path(log_file)}" if log_file
end

options = parse_options
require_rails_env
main(options)
