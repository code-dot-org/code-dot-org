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
require 'ruby-progressbar'
require 'optparse'
require 'parallel'
require_relative '../../deployment'
require_relative '../../lib/cdo/cdo_cli'
require_relative '../../lib/cdo/png_utils'
include CdoCli

DEFAULT_S3_BUCKET = 'cdo-animation-library'.freeze
DEFAULT_OUTPUT_FILE = 'apps/src/gamelab/animationLibrary.json'.freeze

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

    # Parallelize metadata construction because some objects will require an
    # extra S3 request to get version IDs or image dimensions.
    info "Building animation metadata..."
    metadata_progress_bar = ProgressBar.create(total: animations_by_name.size) unless @options[:verbose] || @options[:quiet]
    animation_metadata_by_name = Hash[Parallel.map(animations_by_name, finish: lambda do |_, _, _|
      metadata_progress_bar.increment unless @options[:verbose] || @options[:quiet]
    end) do |name, objects|
      # TODO: Validate that every JSON is paired with a PNG and vice-versa
      # Actually download the JSON from S3
      json_response = objects['json'].get
      metadata = JSON.parse(json_response.body.read)

      # If no frameCount information is present, it's probably a single frame
      metadata['frameCount'] ||= 1

      # TODO: Validate metadata, ensure it has everything it needs
      # Record target version in the metadata, so environments (and projects)
      # consistently reference the version they originally imported.
      metadata['version'] = objects['png'].object.version_id

      # Generate appropriate sourceUrl pointing to the animation library API
      metadata['sourceUrl'] = "/api/v1/animation-library/#{metadata['version']}/#{name}.png"

      # Populate sourceSize if not already present
      unless metadata.key?('sourceSize')
        png_body = objects['png'].object.get.body.read
        metadata['sourceSize'] = PngUtils.dimensions_from_png(png_body)
      end

      verbose <<-EOS
#{bold name} @ #{metadata['version']}
#{JSON.pretty_generate metadata}
      EOS

      [name, metadata]
    end]
    metadata_progress_bar.finish unless @options[:verbose] || @options[:quiet]

    info "Metadata built for #{animation_metadata_by_name.size} animations."

    info "Building alias map..."
    alias_progress_bar = ProgressBar.create(total: animation_metadata_by_name.size) unless @options[:quiet]
    alias_map = Hash.new {|h, k| h[k] = []}
    animation_metadata_by_name.each do |name, metadata|
      aliases = [name]
      aliases += metadata['aliases'] unless metadata['aliases'].nil?
      aliases.each do |aliaz|
        # Push name into target array, deduplicate, and sort
        alias_map[aliaz] = (alias_map[aliaz] + [name]).uniq.sort
      end
      alias_progress_bar.increment unless @options[:quiet]
    end
    alias_progress_bar.finish unless @options[:quiet]

    alias_map.each {|k, v| verbose "#{bold k}: #{v.join(', ')}"} if @options[:verbose]

    info "Mapped #{alias_map.size} aliases."

    # Write result to file
    File.open(DEFAULT_OUTPUT_FILE, 'w') do |file|
      file.write(JSON.pretty_generate({
          '//': [
              'Animation Library Manifest',
              'GENERATED FILE: DO NOT MODIFY DIRECTLY',
              'See tools/scripts/rebuildAnimationLibraryManifest.rb for more information.'
          ],
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
