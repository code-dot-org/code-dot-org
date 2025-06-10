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
  opts.on("-v", "--source-versions", "Include source versions") do
    $options[:source_versions] = true
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

raise 'Input directory is required' unless $options[:input_dir] && !$options[:input_dir].to_s.strip.empty?

$options[:output_dir] ||= $options[:input_dir]

$output_dir = File.join('/mnt/tmp-curriculum-export', 'sourced', $options[:output_dir])
FileUtils.mkdir_p("#{$output_dir}/progress")

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
  response.contents.map(&:key)
end

$max_processes = 25

def process_s3_file(bucket, key)
  output_filename = File.join($output_dir, 'progress', File.basename(key))

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
    if $options[:source_versions]
      data['source_versions'] = get_source_versions(channel_id, latest_source: source)
    end
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

def get_project_source(channel_id, version_id: nil)
  return nil unless channel_id

  source_data = SourceBucket.new.get(channel_id, "main.json", nil, version_id)
  return nil unless source_data && source_data[:body] && source_data[:body].respond_to?(:string)

  main_json = source_data[:body].string
  JSON.parse(main_json)['source']
rescue NoMethodError => exception
  puts "Error getting source for channel id: #{channel_id}: #{exception}"
  nil
end

# returns a list of source versions in the following format:
# [
#   {
#     :versionId=>"EL24MWXWEIZOQS4OC3PAzL0hlrq.GMcA",
#     :lastModified=>2024-09-04 05:08:09 UTC,
#     :isLatest=>true,
#     :version_source=>"...",
#   },
#   ...
# ]
def get_source_versions(channel_id, latest_source:)
  return [] unless channel_id

  versions = SourceBucket.new.list_versions(channel_id, "main.json")
  versions.each do |version|
    version[:version_source] = version[:isLatest] ? latest_source : get_project_source(channel_id, version_id: version[:versionId])
  end
  versions
end

def copy_eval_files
  start_time = Time.now
  # copy evals directory from input_dir in s3 to output_dir in local filesystem
  keys = list_s3_files('cdo-data-sharing-internal', "unloaded-unit-progress/#{$options[:input_dir]}/evals/")
  return if keys.empty?
  puts "Found #{keys.size} files in s3://cdo-data-sharing-internal/unloaded-unit-progress/#{$options[:input_dir]}/evals/"
  system("aws s3 cp --recursive s3://cdo-data-sharing-internal/unloaded-unit-progress/#{$options[:input_dir]}/evals/ #{$output_dir}/evals/")
  raise "Failed to copy evals files" unless $?.success?
  puts "Copied evals files to #{$output_dir}/evals in #{(Time.now - start_time).round(2)} seconds."
end

def main
  start_time = Time.now
  keys = list_s3_files('cdo-data-sharing-internal', "unloaded-unit-progress/#{$options[:input_dir]}/progress/")
  puts "Found #{keys.size} files in s3://cdo-data-sharing-internal/unloaded-unit-progress/#{$options[:input_dir]}/progress/"

  keys.each do |key|
    process_s3_file('cdo-data-sharing-internal', key)
  end

  puts "Processed source in #{(Time.now - start_time).round(2)} seconds."

  copy_eval_files
end

main
