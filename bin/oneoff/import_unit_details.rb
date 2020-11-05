#!/usr/bin/env ruby

require 'json'
require 'optparse'
require_relative '../../deployment'

# Once this script is ready, only levelbuilder should be added to this list.
raise unless [:development, :adhoc].include? rack_env

def parse_options
  OpenStruct.new.tap do |options|
    options.local = false
    options.unit_name = nil
    options.dry_run = false

    opt_parser = OptionParser.new do |opts|
      opts.banner = "\nUsage: #{$0} [options] \n\
        Example: runner.rb -u coursea-2021 \n\
        Example: runner.rb -l -u csd1-2021 \n\
        Example: runner.rb -l -u csp2-2020,csp3-2021,csp4-2021"
      opts.separator ""

      opts.on('-l', '--local', 'Use local curriculum builder running on localhost:8000.') do
        options.local = true
      end

      opts.on('-u', '--unit_name UnitName1,UnitName2', Array, 'Unit names to import') do |f|
        options.unit_name = f
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without importing any data.') do
        options.dry_run = true
      end

      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end
    end

    opt_parser.parse!(ARGV)
  end
end

def main(options)
  script = Script.find_by_name!(options.unit_name)
  puts "found code studio script name #{script.name} with id #{script.id}"
end

options = parse_options
raise "unit name is required. Use -h for options." unless options.unit_name

# Wait until after initial error checking before loading the rails environment.
puts "loading rails environment..."
start_time = Time.now
require_relative '../../dashboard/config/environment'
puts "rails environment loaded in #{(Time.now - start_time).to_i} seconds."

main(options)
