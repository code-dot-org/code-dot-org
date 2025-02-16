#!/usr/bin/env ruby

require 'optparse'
require 'fileutils'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: add_unit_source.rb [options]"
  opts.on("-i", "--s3-input-dir DIR", "Name of input directory under $HOME/exported/filtered/ .") do |input_dir|
    $options[:input_dir] = input_dir
  end
  opts.on("-o", "--output-dir DIR", "Name of output directory  under $HOME/exported/deduped/. default: INPUT_DIR") do |output_dir|
    $options[:output_dir] = output_dir
  end

  opts.on("-h", "--help", "Prints this help") do
    puts opts
    exit
  end
end.parse!

raise 'Input directory is required' unless $options[:input_dir] && !$options[:input_dir].to_s.strip.empty?
input_dir = File.join(Dir.home, 'exported/filtered', $options[:input_dir])
raise 'Input directory must exist' unless Dir.exist?(input_dir)
raise 'Input directory must not be empty' if Dir.empty?(input_dir)

$options[:output_dir] ||= $options[:input_dir]
output_dir = File.join(Dir.home, 'exported/deduped', $options[:output_dir])
FileUtils.mkdir_p(output_dir)
raise 'Output dir must be empty' unless Dir.empty?(output_dir)

Dir.glob("#{input_dir}/*.json") do |infile|
  filename = File.basename(infile)
  output_file = "#{output_dir}/#{filename}"

  # Read, filter, and write back to the output file
  File.open(output_file, "w") do |outfile|
    File.foreach(infile) do |line|
      # Remove blank lines and lines containing multiple json entries
      outfile.puts(line) unless line.strip.empty? || line.include?('}{"user_level_id')
    end
  end

  puts "Processed: #{filename}"
end
