#!/usr/bin/env ruby

require 'optparse'
require 'parallel'
# require 'aws-sdk-s3'
require 'json'
require 'fileutils'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: add_unit_source.rb [options]"
  opts.on("-i", "--s3-input-dir DIR", "Name of input directory under s3://cdo-data-sharing-internal/stanford/unload/ .") do |input_dir|
    $options[:input_dir] = input_dir
  end
  opts.on("-o", "--output-dir DIR", "Name of output directory in local filesystem under $HOME/exported/unfiltered/. default: INPUT_DIR") do |output_dir|
    $options[:output_dir] = output_dir
  end
  opts.on('-p', "--pretty-print") do
    $options[:pretty] = true
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

raise 'Input directory is required' unless $options[:input_dir] && !$options[:input_dir].to_s.strip.empty?

$options[:output_dir] ||= $options[:input_dir]

$output_dir = File.join(Dir.home, 'exported/unfiltered', $options[:output_dir])
FileUtils.mkdir_p($output_dir)
raise 'Output dir must be empty' unless Dir.empty?($output_dir)

require_relative '../../deployment'

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def list_s3_files(bucket, prefix)
  s3 = Aws::S3::Client.new
  response = s3.list_objects_v2(bucket: bucket, prefix: prefix)
  keys = response.contents.map(&:key)
  raise "No files found in s3://#{bucket}/#{prefix}/" if keys.empty?
  keys
end

def process_s3_file(bucket, key)
  puts "Processing s3 file: #{key} basename: #{File.basename(key)}"
  output_filename = File.join($output_dir, File.basename(key))
  File.open(output_filename, 'w') do |file|
    s3 = Aws::S3::Client.new
    s3.get_object(bucket: bucket, key: key) do |row|
      file.write(row)
    end
  end
end

def main
  puts "Processing source..."
  start_time = Time.now

  # list all files in the input directory in s3
  keys = list_s3_files('cdo-data-sharing-internal', "stanford/unload/#{$options[:input_dir]}/")

  # process each file
  keys.each do |key|
    process_s3_file('cdo-data-sharing-internal', key)
  end

  # puts "Processed source in #{(Time.now - start_time).round(2)} seconds. rows: #{results.count} processes: #{$max_processes}"
  puts "Processed source in #{(Time.now - start_time).round(2)} seconds."
end

main
