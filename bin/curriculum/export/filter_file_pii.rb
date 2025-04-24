require 'optparse'
require 'parallel'
require 'json'
require 'fileutils'

# This script operates on the output from add_unit_source.rb. It filters PII from
# student source code within a single input file.

INPUT_TYPES = %w[progress ai_evals teacher_evals]

$options = {
  input_type: 'progress'
}
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
  opts.on("-t", "--input_type TYPE", "Type of input file. One of: #{INPUT_TYPES} default: progress") do |type|
    raise "Unsupported input file type: #{type}" unless INPUT_TYPES.include?(type)
    $options[:input_type] = type
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
# by requiring this script to be called on a single input file.
raise "must specify a filename, or use filter_unit_pii.rb to process an entire directory." unless $options[:filename]

$options[:output_dir] ||= $options[:input_dir]
$output_dir = File.join(home, 'filtered', $options[:output_dir])
$subdir = $options[:input_type] == 'progress' ? 'progress' : 'evals'
FileUtils.mkdir_p("#{$output_dir}/#{$subdir}")
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

  input_filename = File.join($input_dir, $subdir, $options[:filename])
  raise "Input file must exist: #{input_filename}" unless File.exist?(input_filename)
  puts "#{File.basename(__FILE__)} found input file: #{input_filename}"

  process_file(input_filename)
  puts "Filtered PII in #{(Time.now - start_time).to_i} seconds."
end

def process_file(input_filename)
  output_filename = File.join($output_dir, $subdir, File.basename(input_filename))
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
  # process the row based on the input type, so that we don't (a) waste time
  # scanning for irrelevant fields or (b) accidentally do PII filtering on the
  # wrong field if there is overlap in field names between input types.
  case $options[:input_type]
  when 'progress'
    process_source_pii(data)
  when 'ai_evals'
    process_ai_eval_pii(data)
  when 'teacher_evals'
    process_teacher_eval_pii(data)
  else
    raise "Unsupported input type: #{$options[:input_type]}"
  end

  data[:hashed_user_id] = hashed_user_id(data[:user_id])
  data.delete(:user_id)
end

def process_source_pii(data)
  process_field_pii(data, field: :source, related_fields: [:link_to_project, :channel_id])
  process_field_pii(data, field: :student_answer)
  process_source_versions_pii(data)
end

# returns a list of source versions in the following format:
# [
#   {
#     :versionId=>"EL24MWXWEIZOQS4OC3PAzL0hlrq.GMcA",
#     :lastModified=>2024-09-04 05:08:09 UTC,
#     :isLatest=>true,
#     :version_source=>"...",
#     :version_source_pii_score=>0.9999105930328369,
#     :version_source_pii_entities=>[...]
#   },
#   ...
# ]
def process_source_versions_pii(data)
  data[:source_versions].each do |version|
    if version[:isLatest]
      version[:version_source] = data[:source]
      version[:version_source_pii_score] = data[:source_pii_score]
      version[:version_source_pii_entities] = data[:source_pii_entities]
    else
      process_field_pii(version, field: :version_source)
    end
  end
end

def process_ai_eval_pii(data)
  process_field_pii(data, field: :ai_evidence)
  process_field_pii(data, field: :ai_observations)
  process_field_pii(data, field: :ai_feedback_other_content)
end

def process_teacher_eval_pii(data)
  process_field_pii(data,  field: :teacher_feedback)
end

# if the field contains a pii score over the threshold, nil out that field and
# any related fields.
def process_field_pii(data, field:, related_fields: [])
  return unless data[field].present?

  pii_score, pii_entities = check_text_pii(data[field])
  data[:"#{field}_pii_score"] = pii_score
  data[:"#{field}_pii_entities"] = pii_entities
  if pii_score > $pii_threshold
    data[field] = nil
    related_fields.each do |related_field|
      data[related_field] = nil
    end
  end
end

def check_text_pii(text)
  return [0, []] unless text.present?

  params = {
    language_code: "en",
    text: text
  }
  response = $comprehend.detect_pii_entities(params)

  # a string without pii concerns will contain no entities. example responses:
  # {
  #   "text": "the quick brown fox jumped over the lazy dog",
  #   "response": []
  # }
  # {
  #   "text": "the quick brown fox (206) 555-1212 jumped over the lazy dog at 55 main st",
  #   "response": [
  #     "{:score=>0.9999105930328369, :type=>\"PHONE\", :begin_offset=>20, :end_offset=>34}",
  #     "{:score=>0.9999832510948181, :type=>\"ADDRESS\", :begin_offset=>63, :end_offset=>73}"
  #   ]
  # }

  max_score = response.entities.map(&:score).max || 0

  [max_score, response.entities]
rescue => exception
  puts "Error checking text for PII: #{exception.message}"
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
