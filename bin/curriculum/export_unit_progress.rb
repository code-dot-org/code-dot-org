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
  opts.on("-s", "--use-simple-query", "Use simplified query to speed up testing") do
    $options[:simple] = true
  end
  opts.on("-u", "--unit-name UNIT", "Unit name") do |unit_name|
    $options[:unit_name] = unit_name
  end
  opts.on("-z", "--level-id LEVEL", "Level id") do |level_id|
    $options[:level_id] = level_id
  end
  opts.on("-l", "--limit LIMIT") do |limit|
    $options[:limit] = limit
  end
  opts.on('-f', "--offset OFFSET") do |offset|
    $options[:offset] = offset
  end
  opts.on('-p', "--pretty-print") do
    $options[:pretty] = true
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

# TODO: start requiring the unit name, and pass it to
# csd3_including_contained_levels_for_stanford.sql to query an entire unit.

# raise "Unit name is required" unless $options[:unit]

require_relative '../../deployment'
require_relative '../../lib/cdo/redshift' if rack_env?(:production)

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def fetch_progress(simple:, unit_id:, level_id:, limit:, offset:)
  if Rails.env.production?
    # fetch the data from redshift in production, because it relies on an unindexed query on
    # user_levels as well as views that are only available in redshift.
    filename =
      simple ?
        'select_user_levels.sql.erb' :
        'csd3_including_contained_levels_for_stanford.sql.erb'
    pathname = File.expand_path(filename, __dir__)
    query_template = File.read(pathname)
    params = {
      unit_id: unit_id,
      level_id: level_id,
      limit: limit,
      offset: offset,
    }
    query = ERB.new(query_template).result_with_hash(params)
    client = RedshiftClient.instance
    start_time = Time.now
    puts "Querying redshift using #{filename} with #{params}..."
    results = execute_redshift_query(client, query)
    puts "Redshift progress query executed in: #{(Time.now - start_time).round(2)} seconds"
    results
  elsif Rails.env.development?
    # fetch the data from the local db instead of redshift when running in
    # development. this allows us to test the codepaths for project fetch
    # and pii detection without needing to run the script in production.
    unit_progress = UserLevel.where(script_id: unit_id).pluck(:user_id, :level_id, :script_id)
    keys = [:user_id, :level_id, :script_id]
    unit_progress.map! {|row| keys.zip(row).to_h.with_indifferent_access}
    unit_progress
  else
    raise "Unsupported environment: #{Rails.env}"
  end
end

def execute_redshift_query(client, query)
  client.exec(query)
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def main
  simple = $options[:simple]

  unit_name = $options[:unit].presence || 'csd3-2023'
  unit = Unit.find_by!(name: unit_name)
  unit_id = unit.id

  level_id = $options[:level_id].presence
  Level.find(level_id) if level_id

  limit = $options[:limit].presence
  offset = $options[:offset].presence

  fetch_progress(
    simple: simple,
    unit_id: unit_id,
    level_id: level_id,
    limit: limit,
    offset: offset,
  )
end

main
