#!/usr/bin/env ruby

# This script exports source code for every student who has progress in the
# specified unit or level, and writes it to a file along with metatata in jsonl
# format. Results containing PII are omitted from the result set.
#
# This script will mostly be used for a one-off data export in Jan 2025, but may
# be used again in the future to gather additional data.

require 'optparse'
require 'parallel'
require 'erb'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: export_unit_progress.rb [options]"
  opts.on("-u", "--unit-name UNIT", "Unit name") do |unit_name|
    $options[:unit_name] = unit_name
  end
  opts.on("-l", "--level-id LEVEL", "Level id") do |level_id|
    $options[:level_id] = level_id
  end
  opts.on("-o", "--output-dir OUTPUT_DIR", "Output directory name in S3") do |output_dir|
    $options[:output_dir] = output_dir
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

raise "Unit name is required" unless $options[:unit]

require_relative '../../../deployment'

raise "Unsupported environment: #{rack_env}" unless rack_env?(:production)

require_relative '../../lib/cdo/redshift'

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def fetch_progress(unit_name:, level_id:, output_dir:)
  if Rails.env.production?
    # fetch the data from redshift, because it relies on an unindexed query on
    # user_levels as well as views that are only available in redshift.
    filename = 'export_unit_progress.sql.erb'
    pathname = File.expand_path(filename, __dir__)
    query_template = File.read(pathname)
    params = {
      unit_name: unit_name,
      level_id: level_id,
      output_dir: output_dir
    }
    query = ERB.new(query_template).result_with_hash(params)
    client = RedshiftClient.instance
    start_time = Time.now
    puts "Querying redshift using #{filename} with #{params}..."
    execute_redshift_query(client, query)
    puts "Redshift progress query executed in: #{(Time.now - start_time).round(2)} seconds"
  end
end

def execute_redshift_query(client, query)
  client.exec(query)
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def main
  unit_name = $options[:unit].presence
  Unit.find_by!(name: unit_name)

  level_id = $options[:level_id].presence
  Level.find(level_id) if level_id

  output_dir = $options[:output_dir].presence || unit_name

  fetch_progress(
    unit_name: unit_name,
    level_id: level_id,
    output_dir: output_dir
  )
end

main
