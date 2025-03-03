#!/usr/bin/env ruby

require 'optparse'
require 'parallel'
require 'json'
require 'fileutils'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: add_unit_source.rb [options]"
  opts.on("-i", "--s3-input-dir DIR", "Name of input directory under /mnt/tmp-curriculum-export/exported/unfiltered/ .") do |input_dir|
    $options[:input_dir] = input_dir
  end
  opts.on("-o", "--output-dir DIR", "Name of output directory  under /mnt/tmp-curriculum-export/exported/filtered/. default: INPUT_DIR") do |output_dir|
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

home = '/mnt/tmp-curriculum-export'

raise 'Input directory is required' unless $options[:input_dir] && !$options[:input_dir].to_s.strip.empty?
$input_dir = File.join(home, 'exported/unfiltered', $options[:input_dir])
raise 'Input directory must exist' unless Dir.exist?($input_dir)
raise 'Input directory must not be empty' if Dir.empty?($input_dir)

$options[:output_dir] ||= $options[:input_dir]
$output_dir = File.join(home, 'exported/filtered', $options[:output_dir])
FileUtils.mkdir_p($output_dir)
raise 'Output dir must be empty' unless Dir.empty?($output_dir)

require_relative '../../deployment'

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

$comprehend = Aws::Comprehend::Client.new
$pii_threshold = 0.7

$max_processes = 25

def main
  puts "Filtering PII..."
  start_time = Time.now
  input_filenames = Dir.glob(File.join($input_dir, '*.json'))
  puts "Found #{input_filenames.size} input files in #{$input_dir}"
  input_filenames.each do |input_filename|
    process_file(input_filename)
  rescue Parallel::DeadWorker => exception
    puts "parallel error: #{exception.class}: #{exception.message}\n#{exception.backtrace.join("\n")}"
  end
  puts "Filtered PII in #{(Time.now - start_time).to_i} seconds."
end

def process_file(input_filename)
  puts "Processing #{input_filename}"
  start_time = Time.now
  lines = File.read(input_filename).split("\n")
  output_filename = File.join($output_dir, File.basename(input_filename))
  File.open(output_filename, 'w') do |file|
    Parallel.each(lines, in_processes: $max_processes) do |line|
      next if line.blank?

      # parallel processing in the previous step may have put multiple rows in a single line.
      # skip these rather than dumping them as undiagnosed json errors.
      if line.include?('}{"user_level_id"')
        puts "Skipping line containing multiple rows"
        next
      end

      row = JSON.parse(line, symbolize_names: true)
      process_row_pii(row)

      file.flock(File::LOCK_EX)
      file.puts($options[:pretty] ? JSON.pretty_generate(row) : row.to_json)
      file.flush
      file.flock(File::LOCK_UN)
    rescue JSON::ParserError => exception
      puts "Error parsing JSON: #{exception.message}"
    end
  end
  puts "Processed #{lines.size} rows in #{(Time.now - start_time).round(2)} seconds."
end

def process_row_pii(row)
  if row[:source].present?
    pii_score, pii_entities = check_source_pii(row[:source])
    row[:source_pii_score] = pii_score
    row[:source_pii_entities] = pii_entities
    if pii_score > $pii_threshold
      row[:source] = nil
      row[:link_to_project] = nil
      row[:channel_id] = nil
    end
  end

  if row[:student_answer].present?
    pii_score, pii_entities = check_source_pii(row[:student_answer])
    row[:student_answer_pii_score] = pii_score
    row[:student_answer_pii_entities] = pii_entities
    if pii_score > $pii_threshold
      row[:student_answer] = nil
    end
  end

  row[:hashed_user_id] = hashed_user_id(row[:user_id])
  row.delete(:user_id)
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
rescue => exception
  puts "Error checking source for PII: #{exception.message}"
  [1, []]
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

main
