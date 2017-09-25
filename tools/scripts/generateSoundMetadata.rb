#!/usr/bin/env ruby
#
# Given a list of mp3 sounds, generates a matching set of json files that
# consist of sound metadata for use in the Game Lab/App Lab sound library,
# ready to upload to S3.
#
# Script adapted from generateSingleFrameAnimationMetadata.rb
#
# For usage, run ./generateSoundMetadata.rb --help
#
# See also: The Sound Library Tech Spec (requires login):
# https://docs.google.com/document/d/1Oj--H-xwrK3u4A0L5ML73n8XDutsH5n2i8caGRc3NL8/edit
#
require 'optparse'
require 'parallel'
require_relative '../../deployment'
require_relative '../../lib/cdo/cdo_cli'
include CdoCli

begin
  require 'taglib'
rescue LoadError
  puts "You need taglib installed locally to run this script. Run 'brew install taglib' then 'gem install taglib-ruby'."
end

DEFAULT_S3_BUCKET = 'cdo-sound-library'.freeze
DEFAULT_OUTPUT_FILE = 'apps/src/code-studio/soundLibrary.json'.freeze

class MetadataBuilder
  def initialize(options)
    @options = options
  end

  def build_sound_metadatas(files)
    unique_files = files.uniq

    # Load each file and generate a metadata file for it
    Parallel.map(unique_files) do |filename|
      dirname = File.dirname(filename)
      basename = File.basename(filename, '.mp3')
      TagLib::MPEG::File.open(filename) do |mp3_file|
        metadata = {}
        metadata['name'] = basename
        metadata['aliases'] = @options[:aliases] || []
        metadata['time'] = mp3_file.audio_properties.length

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
    #{bold 'Usage: ./generateSoundMetadata.rb [options] [files...]'}

    Given a list of mp3 sounds, generates a matching set of json files that
    consist of sound metadata for use in the Game Lab / App Lab sound library,
    ready to upload to S3.

    See also: The Sound Library Tech Spec (requires login):
    #{dim 'https://docs.google.com/document/d/1Oj--H-xwrK3u4A0L5ML73n8XDutsH5n2i8caGRc3NL8/edit'}

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
  MetadataBuilder.new(options).build_sound_metadatas(ARGV)
end
