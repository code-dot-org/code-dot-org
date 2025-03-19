require 'optparse'
require 'parallel'
require 'json'
require 'fileutils'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on("-i", "--s3-input-dir DIR", "Name of input directory under /mnt/tmp-curriculum-export/sourced/ .") do |input_dir|
    $options[:input_dir] = input_dir
  end
  opts.on("-o", "--output-dir DIR", "Name of output directory  under /mnt/tmp-curriculum-export/filtered/. default: INPUT_DIR") do |output_dir|
    $options[:output_dir] = output_dir
  end
  opts.on("-f", "--filename FILENAME", "Name of input file within input directory.") do |filename|
    $options[:filename] = filename
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

home = '/mnt/tmp-curriculum-export'

raise 'Input directory is required' unless $options[:input_dir] && !$options[:input_dir].to_s.strip.empty?
$input_dir = File.join(home, 'sourced', $options[:input_dir])
raise "Input directory must exist: #{$input_dir}" unless Dir.exist?($input_dir)
raise "Input directory must not be empty: #{$input_dir}" if Dir.empty?($input_dir)

# work around a bug where the second call to Parallel.map fails with Parallel::DeadWorker
# by temporarily requiring this script to be called on a single input file.
raise "must specify a filename, or use filter_unit_pii.rb to process an entire directory." unless $options[:filename]

$options[:output_dir] ||= $options[:input_dir]
$output_dir = File.join(home, 'filtered', $options[:output_dir])
FileUtils.mkdir_p($output_dir)

require_relative '../../../deployment'

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

$comprehend = Aws::Comprehend::Client.new
$pii_threshold = 0.7

$max_processes = 25

def main
  puts "Filtering PII..."
  start_time = Time.now
  input_filenames = get_input_filenames
  input_filenames.each do |input_filename|
    process_file(input_filename)
  end
  puts "Filtered PII in #{(Time.now - start_time).to_i} seconds."
end

def get_input_filenames
  if $options[:filename]
    input_filename = File.join($input_dir, $options[:filename])
    raise "Input file must exist: #{input_filename}" unless File.exist?(input_filename)
    puts "#{File.basename(__FILE__)} found input file: #{input_filename}"
    return [input_filename]
  end
  input_filenames = Dir.glob(File.join($input_dir, '*.jsonl'))
  puts "Found #{input_filenames.size} input files in #{$input_dir}"
  input_filenames
end

def process_file(input_filename)
  output_filename = File.join($output_dir, File.basename(input_filename))
  if File.exist?(output_filename)
    puts "Skipping #{input_filename} because output file already exists: #{output_filename}"
    return
  end

  puts "Processing #{input_filename} in #{$max_processes} processes..."
  start_time = Time.now
  rows = File.read(input_filename).split("\n")

  rows = Parallel.map(rows, in_processes: $max_processes) do |row|
    data = JSON.parse(row, symbolize_names: true)
    process_row_pii(data)
    data.to_json
  rescue JSON::ParserError => exception
    puts "Error parsing JSON: #{exception.message}. row:\n#{row}"
    row
  end

  File.open(output_filename, 'w') do |file|
    rows.each {|row| file.puts(row)}
  end

  puts "Processed #{rows.size} rows in #{(Time.now - start_time).round(2)} seconds."
end

def process_row_pii(data)
  if data[:source].present?
    pii_score, pii_entities = check_source_pii(data[:source])
    data[:source_pii_score] = pii_score
    data[:source_pii_entities] = pii_entities
    if pii_score > $pii_threshold
      data[:source] = nil
      data[:link_to_project] = nil
      data[:channel_id] = nil
    end
  end

  if data[:student_answer].present?
    pii_score, pii_entities = check_source_pii(data[:student_answer])
    data[:student_answer_pii_score] = pii_score
    data[:student_answer_pii_entities] = pii_entities
    if pii_score > $pii_threshold
      data[:student_answer] = nil
    end
  end

  data[:hashed_user_id] = hashed_user_id(data[:user_id])
  data.delete(:user_id)
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
