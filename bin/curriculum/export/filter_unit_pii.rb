#!/usr/bin/env ruby

# This script operates on the output from add_unit_source.rb. It filters out
# personally identifiable information (PII) from student source code using AWS
# Comprehend.

require 'optparse'
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

input_filenames = Dir.glob(File.join($input_dir, '*.jsonl'))
puts "#{File.basename(__FILE__)} found #{input_filenames.size} input files in #{$input_dir}"

input_filenames.each do |input_filename|
  puts "Processing #{input_filename}"
  system("SKIP_SCRIPT_PRELOAD=1 bundle exec ruby #{File.join(__dir__, 'filter_pii_helper.rb')} -i #{$options[:input_dir]} -f #{File.basename(input_filename)}")
end
