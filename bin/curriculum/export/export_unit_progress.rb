#!/usr/bin/env ruby

# This script exports source code for every student who has progress in the
# specified unit or level, and writes it to a file along with metatata in jsonl
# format. The query is sent to redshift, and the query instructs redshift to
# write the result directly to S3.

require 'optparse'
require 'parallel'
require 'erb'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on("-u", "--unit-name UNIT_NAME", "Unit name") do |unit_name|
    $options[:unit_name] = unit_name
  end
  opts.on("-l", "--level-id LEVEL", "Level id") do |level_id|
    $options[:level_id] = level_id
  end
  opts.on("-o", "--output-dir OUTPUT_DIR", "Output directory name in S3") do |output_dir|
    $options[:output_dir] = output_dir
  end
  opts.on("-r", "--rubric-evals", "Include rubric evaluations") do
    $options[:rubric_evals] = true
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

raise "Unit name is required" unless $options[:unit_name]

require_relative '../../../deployment'

raise "Unsupported environment: #{rack_env}" unless rack_env?(:production)

require_relative '../../../lib/cdo/redshift'

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def unload_progress(query_params:)
  # fetch the data from redshift, because:
  # 1. the query relies on views that only exist in redshift
  # 2. the query would run slowly against the production database because
  #    it references columns in user_levels that are not indexed
  query_filename = 'export_unit_progress.sql.erb'
  unload_from_redshift(query_filename: query_filename, query_params: query_params)
end

def unload_evidence_levels(query_params:)
  query_filename = 'export_evidence_levels.sql.erb'
  unload_from_redshift(query_filename: query_filename, query_params: query_params)
end

def unload_ai_evals(query_params:)
  query_filename = 'export_ai_evals.sql.erb'
  unload_from_redshift(query_filename: query_filename, query_params: query_params)
end

def unload_teacher_evals(query_params:)
  query_filename = 'export_teacher_evals.sql.erb'
  unload_from_redshift(query_filename: query_filename, query_params: query_params)
end

def unload_from_redshift(query_filename:, query_params:)
  pathname = File.expand_path(query_filename, __dir__)
  query_template = File.read(pathname)
  query = ERB.new(query_template).result_with_hash(query_params)
  client = RedshiftClient.instance
  start_time = Time.now
  puts "Querying redshift using #{query_filename} with #{query_params}..."
  execute_redshift_query(client, query)
  puts "Redshift query executed in: #{(Time.now - start_time).round(2)} seconds"
end

def execute_redshift_query(client, query)
  client.exec(query)
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def main
  unit_name = $options[:unit_name].presence
  Unit.find_by!(name: unit_name)

  level_id = $options[:level_id].presence
  Level.find(level_id) if level_id

  output_dir = $options[:output_dir].presence || unit_name

  query_params = {
    unit_name: unit_name,
    level_id: level_id,
    output_dir: output_dir
  }

  if $options[:rubric_evals]
    unload_evidence_levels(query_params: query_params)
    unload_ai_evals(query_params: query_params)
    unload_teacher_evals(query_params: query_params)
  end

  unload_progress(query_params: query_params)
end

main
