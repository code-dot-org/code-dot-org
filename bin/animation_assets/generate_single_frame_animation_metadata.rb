#!/usr/bin/env ruby
#
# Given a list of png images, generates a matching set of json files that
# consist of animation metadata for use in the Game Lab animation library,
# ready to upload to S3.
#
# For usage, run ./generate_single_frame_animation_metadata.rb --help
#
# See also: The Animation Library Tech Spec (requires login):
# https://docs.google.com/document/d/18-LVuvKd0jKTUiGo5GYReUWM5oFWCyKRyEQURJ5HCOM/edit
#
require 'optparse'
require 'parallel'
require_relative '../../deployment'
require_relative '../../lib/cdo/cdo_cli'
require_relative '../../lib/cdo/png_utils'
include CdoCli

DEFAULT_S3_BUCKET = 'cdo-animation-library'.freeze
DEFAULT_OUTPUT_FILE = 'apps/src/gamelab/animationLibrary.json'.freeze

class MetadataBuilder
  def initialize(options)
    @options = options
  end

  def build_single_frame_metadatas(files)
    unique_files = files.uniq

    # Load each file and generate a metadata file for it
    Parallel.map(unique_files) do |filename|
      dirname = File.dirname(filename)
      basename = File.basename(filename, '.png')
      File.open(filename) do |png_file|
        metadata = {}
        metadata['name'] = basename
        metadata['aliases'] = @options[:aliases] || []
        metadata['frameCount'] = 1
        metadata['frameSize'] = PngUtils.dimensions_from_png(png_file.read)
        metadata['looping'] = true
        metadata['frameDelay'] = 2

        # Write metadata to file
        File.open(File.join(dirname, basename + '.json'), 'w') do |json_file|
          json_file.write(JSON.pretty_generate(metadata))
          verbose "Wrote #{basename}.json"
        end
      end
    end
    info "Generated metadata for #{unique_files.size} files"
  end

  def verbose(s)
    puts(s) if @options[:verbose]
  end

  def info(s)
    puts(s) unless @options[:quiet]
  end

  def warn(s)
    puts(s)
  end
end

# Parse command-line options and then start the metadata generation process
options = {}
cli_parser = OptionParser.new do |opts|
  opts.banner = <<-HELP.unindent
    #{bold 'Usage: ./generateSingleFrameAnimationMetadata.rb [options] [files...]'}

    Given a list of png images, generates a matching set of json files that
    consist of animation metadata for use in the Game Lab animation library,
    ready to upload to S3.

    See also: The Animation Library Tech Spec (requires login):
    #{dim 'https://docs.google.com/document/d/18-LVuvKd0jKTUiGo5GYReUWM5oFWCyKRyEQURJ5HCOM/edit'}

    Options:
  HELP

  opts.on("--aliases one,two,...", Array, "Search aliases to include in metadata for ALL processed files") do |list|
    options[:aliases] = list
  end

  opts.on('-q', '--quiet', 'Only log warnings and errors') do
    options[:quiet] = true
  end

  opts.on('-v', '--verbose', 'Use verbose log output') do
    options[:verbose] = true
  end

  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
end
cli_parser.parse!
if ARGV.empty?
  puts cli_parser
  exit (-1)
else
  MetadataBuilder.new(options).build_single_frame_metadatas(ARGV)
end
