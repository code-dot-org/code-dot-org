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

      opts.on('-u', '--unit_names UnitName1,UnitName2', Array, 'Unit names to import') do |unit_names|
        options.unit_names = unit_names
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
  cb_url_prefix = options.local ? 'http://localhost:8000' : 'https://www.codecurricula.com'

  options.unit_names.each do |unit_name|
    script = Script.find_by_name!(unit_name)
    puts "found code studio script name #{script.name} with id #{script.id}"

    url = "#{cb_url_prefix}/export/unit/#{unit_name}.json?format=json"
    puts "fetching unit json from #{url}"
    cb_unit_json = `curl #{url}`
    puts "received #{cb_unit_json.length} bytes of unit json."

    cb_unit_data = JSON.parse(cb_unit_json)
    validate_unit(script, cb_unit_data)
  end
end

def validate_unit(script, cb_unit_data)
  raise "unexpected unit_name #{cb_unit_data['unit_name']}" unless cb_unit_data['unit_name'] == script.name
  puts "validated unit data for #{script.name}"
end

options = parse_options
raise "unit name is required. Use -h for options." unless options.unit_names.present?

# Wait until after initial error checking before loading the rails environment.
puts "loading rails environment..."
start_time = Time.now
require_relative '../../dashboard/config/environment'
puts "rails environment loaded in #{(Time.now - start_time).to_i} seconds."

main(options)
