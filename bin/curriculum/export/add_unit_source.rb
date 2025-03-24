#!/usr/bin/env ruby

# This script operates on the output from export_unit_progress.rb. It adds the
# source code for each project to the output file. Currently it relies on being
# run in the production environment, because it relies on both dashboard code
# and production secrets for fetching project source. While the dependency on
# dashboard code (and the need to load the rails environment) could be removed,
# the production secret would still be needed.

require 'optparse'
require 'parallel'
require 'json'
require 'fileutils'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on("-i", "--s3-input-dir DIR", "Name of input directory under s3://cdo-data-sharing-internal/unloaded-unit-progress/ .") do |input_dir|
    $options[:input_dir] = input_dir
  end
  opts.on("-o", "--output-dir DIR", "Name of output directory in local filesystem under /mnt/tmp-curriculum-export/sourced/. default: INPUT_DIR") do |output_dir|
    $options[:output_dir] = output_dir
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

raise 'Input directory is required' unless $options[:input_dir] && !$options[:input_dir].to_s.strip.empty?

$options[:output_dir] ||= $options[:input_dir]

$output_dir = File.join('/mnt/tmp-curriculum-export', 'sourced', $options[:output_dir])
FileUtils.mkdir_p($output_dir)

require_relative '../../../deployment'

raise "Unsupported environment: #{rack_env}" unless rack_env?(:production)

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../../dashboard/config/environment'
# load secret before parallelizing to reduce debug spew
CDO.channels_api_secret
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def list_s3_files(bucket, prefix)
  s3 = Aws::S3::Client.new
  response = s3.list_objects_v2(bucket: bucket, prefix: prefix)
  keys = response.contents.map(&:key)
  raise "No files found in s3://#{bucket}/#{prefix}/" if keys.empty?
  keys
end

$max_processes = 25

def process_s3_file(bucket, key)
  output_filename = File.join($output_dir, File.basename(key))

  if File.exist?(output_filename)
    puts "Skipping #{File.basename(key)} because output file already exists: #{output_filename}"
    return
  end

  puts "Downloading s3://#{bucket}/#{key}"
  start_time = Time.now
  s3 = Aws::S3::Client.new
  response = s3.get_object(bucket: bucket, key: key)
  rows = response.body.string.each_line.to_a
  puts "Downloaded #{rows.size} rows in #{(Time.now - start_time).round(2)} seconds."

  puts "Processing #{File.basename(key)} in parallel with #{$max_processes} processes"
  start_time = Time.now
  rows = Parallel.map(rows, in_processes: $max_processes) do |row|
    data = JSON.parse(row)
    channel_id = data['channel_id']
    source = get_project_source(channel_id)
    data['source'] = source
    data.to_json
  rescue JSON::ParserError => exception
    puts "Error parsing JSON: #{exception}"
    row
  end

  File.open(output_filename, 'w') do |file|
    rows.each {|row| file.puts(row)}
  end

  puts "Processed #{rows.size} rows in #{(Time.now - start_time).round(2)} seconds."
end

def get_project_source(channel_id)
  return nil unless channel_id

  source_data = SourceBucket.new.get(channel_id, "main.json")
  return nil unless source_data && source_data[:body] && source_data[:body].respond_to?(:string)

  main_json = source_data[:body].string
  JSON.parse(main_json)['source']
rescue NoMethodError => exception
  puts "Error getting source for channel id: #{channel_id}: #{exception}"
  nil
end

def main
  start_time = Time.now
  keys = list_s3_files('cdo-data-sharing-internal', "unloaded-unit-progress/#{$options[:input_dir]}/")
  puts "Found #{keys.size} files in s3://cdo-data-sharing-internal/unloaded-unit-progress/#{$options[:input_dir]}/"

  keys.each do |key|
    process_s3_file('cdo-data-sharing-internal', key)
  end

  puts "Processed source in #{(Time.now - start_time).round(2)} seconds."
end

main
