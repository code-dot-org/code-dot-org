#!/usr/bin/env ruby
#
# Regenerates an animation library manifest by reading the contents of S3 bucket
# cdo-animation-library.
#
# For usage, run ./rebuildAnimationLibraryManifest.rb --help
#
# The manifest has three important jobs:
# 1. Provide the metadata used to render spritesheets as animations.
# 2. Point to particular versions of the spritesheets on S3.
# 3. Provide a precomputed search tree for quick animation searches by keyword.
#
# The expected output of this file is a new animationLibrary.json which is
# consumed by the apps build.  You'll need to manually check this file into git.
#
# See also: The Animation Library Tech Spec (requires login):
# https://docs.google.com/document/d/18-LVuvKd0jKTUiGo5GYReUWM5oFWCyKRyEQURJ5HCOM/edit
#
# TODO: Optimize: Read existing manifest and don't do full object reads for
#       entries whose modify date hasn't changed.
require 'aws-sdk'
require 'optparse'
require_relative '../../deployment'

DEFAULT_S3_BUCKET = 'cdo-animation-library'
DEFAULT_OUTPUT_FILE = 'apps/src/gamelab/animationLibrary.json'

class ManifestBuilder
  def initialize(options)
    @options = options
  end

  #
  # Main Entry Point
  # See end of file for possible options, parsed from command line
  #
  def rebuild_animation_library_manifest
    animations_by_name = {}

    # Connect to S3 and get a listing of all objects in the animation library bucket
    info 'Reading object list from S3...'
    bucket = Aws::S3::Bucket.new(DEFAULT_S3_BUCKET)
    bucket.objects.each do |object_summary|
      animation_name = object_summary.key[/^[^.]+/]
      extension = object_summary.key[/(?<=\.)\w+$/]
      verbose <<-EOS.unindent
        #{bold object_summary.key}
          #{object_summary.last_modified} | #{object_summary.size}
      EOS
      # Push into animations collection
      animations_by_name[animation_name] ||= {}
      animations_by_name[animation_name][extension] = object_summary
    end

    # TODO: Validate that keys are unique

    info "Found #{animations_by_name.size} animations."

    animation_metadata_by_name = {}
    info "Building animation metadata..."
    animations_by_name.each do |name, objects|
      # TODO: Validate that every JSON is paired with a PNG and vice-versa
      # Actually download the JSON from S3
      json_response = objects['json'].get
      metadata = JSON.parse(json_response.body.read)
      # TODO: Validate metadata, ensure it has everything it needs
      metadata['version'] = objects['png'].object.version_id

      # Populate sourceSize if not already present
      unless metadata.key?('sourceSize')
        png_body = objects['png'].object.get.body.read
        metadata['sourceSize'] = dimensions_from_png(png_body)
      end

      animation_metadata_by_name[name] = metadata
      verbose <<-EOS
#{bold name} @ #{metadata['version']}
#{JSON.pretty_generate metadata}
      EOS
    end

    info "Metadata built for #{animation_metadata_by_name.size} animations."

    info "Building alias map..."

    alias_map = {}
    animation_metadata_by_name.each do |name, metadata|
      aliases = [name] + (metadata['aliases'] || [])
      aliases.each do |aliaz|
        # Push name into target array, deduplicate, and sort
        alias_map[aliaz] = ((alias_map[aliaz] || []) + [name]).uniq.sort
      end
    end

    alias_map.each {|k, v| verbose "#{bold k}: #{v.join(', ')}"} if @options[:verbose]

    info "Mapped #{alias_map.size} aliases."

    # Write result to file
    File.open(DEFAULT_OUTPUT_FILE, 'w') do |file|
      file.write(JSON.pretty_generate({
          'metadata': animation_metadata_by_name,
          'aliases': alias_map
      }))
    end
    info <<-EOS.unindent
      Manifest written to #{DEFAULT_OUTPUT_FILE}.

        #{dim 'd[ o_0 ]b'}
    EOS

  # Report any issues while talking to S3 and suggest most likely steps for fixing it.
  rescue Aws::Errors::ServiceError => service_error
    warn service_error.inspect
    warn <<-EOS.unindent

      #{bold 'There was an error talking to S3.'}  Make sure you have credentials set using one of:

        * aws_access_key and aws_secret_key in your locals.yml
        * ENV['AWS_ACCESS_KEY_ID'] and ENV['AWS_SECRET_ACCESS_KEY']
        * ~/.aws/credentials

      #{dim 'See http://docs.aws.amazon.com/sdkforruby/api/Aws/S3/Client.html for more details.'}
    EOS
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

# Given the complete body of a PNG file, returns hash of source dimensions:
# {"x": _, "y": _}
def dimensions_from_png(png_body)
  # Read the first eight bytes of the IHDR Chunk, which must always be the
  # first chunk of the PNG file.
  #
  # PNG Header takes 8 bytes (0x00-0x07)
  # IHDR chunk length takes 4 bytes (0x08-0x0b)
  # IHDR chunk type code takes 4 bytes (0x0c-0x0f)
  # IHDR chunk data begins at 0x10
  #
  # The IHDR chunk begins with
  # 4 bytes for width (0x10-0x13) followed by
  # 4 bytes for height (0x14-0x17)
  #
  # PNG File Structure
  # http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html
  # IHDR Chunk Layout
  # http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html#C.IHDR
  dimensions = png_body[0x10..0x18].unpack('NN')
  {'x': dimensions[0], 'y': dimensions[1]}
end

# Utility to strip consistent leading whitespace from heredoc strings, allowing
# you to format your code more readably.
#
# Usage:
#   <<-DOC.unindent
#     Some text or other that I want to start in column 1.
#         An actually indented line.
#     This line still unindented.
#   DOC
#
# from http://stackoverflow.com/a/5638187/5000129
class String
  # Strip leading whitespace from each line that is the same as the
  # amount of whitespace on the least-indented line of the string.
  def unindent
    gsub /^#{scan(/^[ \t]+/).min_by(&:length)}/, ''
  end
end

# Terminal style utilities for fashionable output
def stylize(text, color_code)
  "\e[#{color_code}m#{text}\e[0m"
end

def bold(text); stylize(text, 1); end
def dim(text); stylize(text, 2); end
def underline(text); stylize(text, 4); end

# Parse command-line options and then start the rebuild process
options = {}
cli_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./rebuildAnimationLibraryManifest.rb [options]"
  opts.separator ""
  opts.separator "Options:"

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
cli_parser.parse!(ARGV)
ManifestBuilder.new(options).rebuild_animation_library_manifest
