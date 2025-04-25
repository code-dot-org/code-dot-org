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

$options[:output_dir] ||= $options[:input_dir]
$output_dir = File.join(home, 'filtered', $options[:output_dir])

def filter_progress_pii
  input_filenames = Dir.glob(File.join($input_dir, 'progress', '*.jsonl'))
  puts "#{File.basename(__FILE__)} found #{input_filenames.size} input files in #{$input_dir}/progress"

  input_filenames.each do |input_filename|
    filter_file_pii(File.basename(input_filename), 'progress')
  end
end

def filter_evals_pii
  return unless Dir.exist?(File.join($input_dir, 'evals'))
  ai_evals_filename = get_evals_filename('_ai_evals_')
  teacher_evals_filename = get_evals_filename('_teacher_evals_')
  evidence_levels_filename = get_evals_filename('_evidence_levels_')

  filter_file_pii(ai_evals_filename, 'ai_evals') if ai_evals_filename
  filter_file_pii(teacher_evals_filename, 'teacher_evals') if teacher_evals_filename

  command = "cp #{$input_dir}/evals/#{evidence_levels_filename} #{$output_dir}/evals/"
  puts "command: #{command}"
  system(command)
end

def get_evals_filename(pattern)
  filenames = Dir.glob(File.join($input_dir, 'evals', '*.jsonl'))
  filename = filenames.find {|name| name.include?(pattern)}
  return File.basename(filename) if filename
  puts "No #{pattern} found in #{$input_dir}/evals"
  nil
end

def filter_file_pii(filename, type)
  command = "SKIP_SCRIPT_PRELOAD=1 bundle exec ruby #{File.join(__dir__, 'filter_file_pii.rb')} " \
    "-i #{$options[:input_dir]} -o #{$options[:output_dir]} -f #{filename} -t #{type}"
  puts "command: #{command}"
  system(command)
end

def main
  filter_progress_pii
  filter_evals_pii
end

main
