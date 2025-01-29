#!/usr/bin/env ruby

# This script exports source code for every student who has progress in the
# specified unit or level, and writes it to a file along with metatata in jsonl
# format. Results containing PII are omitted from the result set.
#
# This script will mostly be used for a one-off data export in Jan 2025, but may
# be used again in the future to gather additional data.

require 'optparse'
require 'parallel'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: export_unit_progress.rb [options]"
  opts.on("-u", "--unit UNIT", "Unit name") do |unit|
    $options[:unit] = unit
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

# thread-safe client for AWS Comprehend
$comprehend = Aws::Comprehend::Client.new
$pii_threshold = 0.7

$max_threads = 100

def fetch_progress
  if Rails.env.production?
    # fetch the data from redshift in production, because it relies on an unindexed query on
    # user_levels as well as views that are only available in redshift.
    filename = File.expand_path('csd3_including_contained_levels_for_stanford.sql', __dir__)
    query = File.read(filename)
    client = RedshiftClient.instance
    execute_redshift_query(client, query)
  elsif Rails.env.development?
    # fetch the data from the local db instead of redshift when running in
    # development. this allows us to test the codepaths for project fetch
    # and pii detection without needing to run the script in production.
    unit_name = $options[:unit].presence || 'csd3-2024'
    unit = Unit.find_by_name(unit_name)
    raise "Unit not found: #{unit_name}" unless unit
    unit_progress = UserLevel.where(script_id: unit.id).pluck(:user_id, :level_id, :script_id)
    keys = [:user_id, :level_id, :script_id]
    unit_progress.map! {|row| keys.zip(row).to_h.with_indifferent_access}
    unit_progress
  else
    raise "Unsupported environment: #{Rails.env}"
  end
end

def execute_redshift_query(client, query)
  start_time = Time.now
  result = client.exec(query)
  puts "Redshift query executed in: #{(Time.now - start_time).round(2)} seconds"
  result
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def get_project_channel_id(user_id, level_id, script_id)
  user_storage_id = storage_id_for_user_id(user_id)
  return unless user_storage_id

  level = Level.find(level_id)
  return unless level

  # takes project-backed levels into account
  channel_token = ChannelToken.find_channel_token(level, user_storage_id, script_id)
  return unless channel_token

  channel_token.channel
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

def process_row_pii(row)
  pii_score, pii_entities = check_source_pii(row[:source])
  row[:pii_score] = pii_score
  row[:pii_entities] = pii_entities
  if pii_score > $pii_threshold
    row[:source] = nil
    row['link_to_project'] = nil
    row[:channel_id] = nil
  end
end

def check_source_pii(source)
  return [0, []] unless source.present?

  params = {
    language_code: "en",
    text: source
  }
  response = $comprehend.detect_pii_entities(params)

  # a string without pii concerns will contain no entities. example responses:
  # {
  #   "source": "the quick brown fox jumped over the lazy dog",
  #   "response": []
  # }
  # {
  #   "source": "the quick brown fox (206) 555-1212 jumped over the lazy dog at 55 main st",
  #   "response": [
  #     "{:score=>0.9999105930328369, :type=>\"PHONE\", :begin_offset=>20, :end_offset=>34}",
  #     "{:score=>0.9999832510948181, :type=>\"ADDRESS\", :begin_offset=>63, :end_offset=>73}"
  #   ]
  # }

  max_score = response.entities.map(&:score).max || 0

  [max_score, response.entities]
end

def hashed_user_id(user_id)
  secret_key = CDO.properties_encryption_key
  raise "missing CDO.properties_encryption_key" unless secret_key

  # a one-way hash that cannot be reverse-engineered by guessing and
  # checking user ids without knowing the secret.
  input_data = "#{user_id}#{secret_key}"
  digest = Digest::SHA256.hexdigest(input_data)

  # truncate to 128 bits to make digest length more manageable. user ids are
  # currently 27 bits in 2025. chance of collision is 2^-75 which low enough to ignore.
  # https://en.wikipedia.org/wiki/Birthday_attack#Simple_approximation
  digest[0..31]
end

def main
  results = fetch_progress

  puts "Looking up channel ids..."
  start_time = Time.now
  # not parallelizing this step yet because we are limited to 5 connections to active record.
  results = results.map do |row|
    channel_id = get_project_channel_id(row['user_id'], row['level_id'], row['script_id'])
    row[:channel_id] = channel_id
    row
  end
  puts "Channel id lookups completed in #{(Time.now - start_time).round(2)} seconds. rows: #{results.count}"

  puts "Processing source..."
  start_time = Time.now
  File.open('output.jsonl', 'w') do |file|
    mutex = Mutex.new

    # parallelize network requests to projects API and AWS Comprehend
    Parallel.each(results, in_threads: $max_threads) do |row|
      row[:source] = get_project_source(row[:channel_id])

      process_row_pii(row)

      row[:hashed_user_id] = hashed_user_id(row['user_id'])
      row.delete('user_id')

      mutex.synchronize do
        file.puts row.to_json
      end
    end
  end
  puts "Processed source in #{(Time.now - start_time).round(2)} seconds. rows: #{results.count} threads: #{$max_threads}"
end

main
