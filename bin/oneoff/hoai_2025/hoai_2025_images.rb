#!/usr/bin/env ruby

require 'aws-sdk-s3'
require 'ruby-progressbar'
require 'optparse'
require 'parallel'
require File.expand_path('../../../../dashboard/config/environment', __FILE__)
require_relative '../../../lib/cdo/aws/s3'
require_relative '../../../deployment'

key = ENV.fetch("OPENAI_API_KEY", nil) || CDO.openai_student_learning_api_key.presence
raise "Missing OpenAI API key (set openai_student_learning_api_key or OPENAI_API_KEY)" if key.blank?

BUCKET_NAME = 'cdo-curriculum'
BUCKET_PATH = 'media/musiclab/generate/dancer/'

# Parse options
options = {
  dry_run: true,
  production: false,
  just_upload: false,
  attires: [],
  animals: [],
  adjectives: [],
  redo_only: [],
}
OptionParser.new do |opts|
  opts.banner = <<~BANNER
    Usage: #{File.basename(__FILE__)} [options]

    This script calls the Python hoai_2025 image generation script and, if not
    a dry run, uploads them to S3.

    Options:
  BANNER

  opts.on('--[no-]dry-run',
          'Disables the read-only mode where no changes are written to S3'
         ) do |no_dry_run|
           options[:dry_run] = no_dry_run
         end

  opts.on('--production',
          'Publishes the content into the production bucket.'
         ) do |production|
           options[:production] = production
         end

  opts.on('--just-upload',
          'Skips the image generation script and just uploads'
         ) do |just_upload|
           options[:just_upload] = just_upload
         end

  opts.on('-a', '--attire ATTIRE',
          'Adds the given string to the attires list. If none are specified, uses attires.txt',
         ) do |attire|
           options[:attires] << attire
         end

  opts.on('-n', '--animal ANIMAL',
          'Adds the given string to the animals list. If none are specified, uses animals.txt',
         ) do |animal|
           options[:animals] << animal
         end

  opts.on('-j', '--adjective ADJECTIVE',
          'Adds the given string to the adjectives list. If none are specified, uses adjectives.txt',
         ) do |adjective|
           options[:adjectives] << adjective
         end
  opts.on('--redo-only TARGETS',
          'ONLY redo specific variants (e.g., flame_03).',
          'May be repeated or comma-separated (e.g., "a_01,b_02").'
         ) do |targets|
    options[:redo_only].concat(
      targets.split(',').map(&:strip).reject(&:empty?)
    )
  end

  opts.on('-h', '--help', 'Prints this help message') do
    puts opts
    exit
  end
end.parse!

[:attires, :animals, :adjectives].each do |set|
  if options[set].empty?
    options[set] = File.readlines(File.join(File.dirname(__FILE__), "./#{set}.txt")).map(&:strip).filter {|i| !i.empty?}
  end
end

puts 'Running the generator... (you may need OPENAI_API_KEY set in your environment)'
puts

python_path = File.join(File.dirname(__FILE__), '../../../python/hoai_2025')
Dir.chdir(python_path)
python_args = ""
python_args << " #{options[:attires].map {|a| "-a '#{a}'"}.join(' ')}"
python_args << " #{options[:animals].map {|a| "-n '#{a}'"}.join(' ')}"
python_args << " #{options[:adjectives].map {|a| "-j '#{a}'"}.join(' ')}"
python_args << " -k '#{key}'"
unless options[:redo_only].empty?
  python_args << " --redo-only #{options[:redo_only].map {|t| "'#{t}'"}.join(' ')}"
end
puts "python -m hoai_2025.combinatoric_generation#{python_args}"
system("uv run python -m hoai_2025.combinatoric_generation#{python_args}") unless options[:just_upload]
Dir.chdir('../..')

# We put the things in 'cdo-curriculum-devel' unless we use --production
bucket_name = "#{BUCKET_NAME}#{options[:production] ? '' : '-devel'}"

puts
puts "Images generated. Uploading to `#{bucket_name}`..."

unless options[:production]
  puts "Note: Not publishing to the production bucket. To do this, add --production to the command"
end

if options[:dry_run]
  puts
  puts 'This was a dry run. Not uploading content to S3'
  puts "Please inspect `#{File.join(python_path, 'output')}`"
  puts 'If this looks correct, invoke this script again with --no-dry-run as an option'
  exit
end

# Upload the output path to S3
output_path = File.join(python_path, 'output', 'dance_party_animal_heads_v2')

# Collect all paths
objects = {}

Dir.glob(File.join(output_path, '**', '*.*').to_s) do |file_path|
  key = file_path[(output_path.length + 1)..]
  objects[key] = file_path
end

# Parallelize uploading them to the bucket
upload_progress_bar = ProgressBar.create(total: objects.size)
Parallel.map(objects.keys, finish: lambda do |_, _, _|
  upload_progress_bar&.increment
end
) do |name|
  path = objects[name]

  # Upload json
  if name.end_with?('.json')
    AWS::S3.upload_to_bucket(
      bucket_name,
      File.join(BUCKET_PATH, name),
      File.read(path),
      acl: 'public-read',
      no_random: true,
      content_type: 'json'
    )
  elsif name.end_with?('.png')
    # Upload png
    AWS::S3.upload_to_bucket(
      bucket_name,
      File.join(BUCKET_PATH, name),
      File.read(path),
      acl: 'public-read',
      no_random: true,
      content_type: 'image/png'
    )
  else
    puts "WARNING: #{path} is not an expected file type"
  end

  true
end
upload_progress_bar&.finish

puts
puts 'Done.'
