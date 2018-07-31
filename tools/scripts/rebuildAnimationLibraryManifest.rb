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
require 'aws-sdk-s3'
require 'ruby-progressbar'
require 'optparse'
require 'parallel'
require_relative '../../deployment'
require_relative '../../lib/cdo/cdo_cli'
require_relative '../../lib/cdo/png_utils'
include CdoCli

DEFAULT_S3_BUCKET = 'cdo-animation-library'.freeze
DEFAULT_OUTPUT_FILE = "#{`git rev-parse --show-toplevel`.strip}/apps/src/gamelab/animationLibrary.json".freeze
DOWNLOAD_DESTINATION = '~/cdo-animation-library'.freeze

class Hash
  # Like Enumerable::map but returns a Hash instead of an Array
  def hmap(&block)
    Hash[map {|k, v| yield k, v}]
  end

  # Drop a key from the hash, returning the hash (destructive)
  def omit!(key)
    tap {|hs| hs.delete(key)}
  end
end

class ManifestBuilder
  def initialize(options)
    @options = options
    @warnings = []
  end

  #
  # Main Entry Point
  # See end of file for possible options, parsed from command line
  #
  def rebuild_animation_library_manifest
    # Connect to S3 and get a listing of all objects in the animation library bucket
    bucket = Aws::S3::Bucket.new(DEFAULT_S3_BUCKET)
    animation_objects = get_animation_objects(bucket)
    info "Found #{animation_objects.size} animations."

    info "Building animation metadata..."
    animation_metadata = build_animation_metadata(animation_objects, read_old_metadata)
    info "Metadata built for #{animation_metadata.size} animations."

    info "Building alias map..."
    alias_map = build_alias_map(animation_metadata)
    info "Mapped #{alias_map.size} aliases."

    # Write result to file
    File.open(DEFAULT_OUTPUT_FILE, 'w') do |file|
      file.write(
        JSON.pretty_generate(
          {
            # JSON-style file comment
            '//': [
              'Animation Library Manifest',
              'GENERATED FILE: DO NOT MODIFY DIRECTLY',
              'See tools/scripts/rebuildAnimationLibraryManifest.rb for more information.'
            ],

            # Strip aliases from metadata - they're no longer needed since they
            #   are represented in the alias map.
            # Also sort for stable updates
            'metadata': animation_metadata.hmap {|k, v| [k, v.omit!('aliases')]}.sort.to_h,

            # Sort alias map for stable updates
            'aliases': alias_map.sort.to_h
          }
        )
      )
    end

    @warnings.each {|warning| warn "#{bold 'Warning:'} #{warning}"}

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

  #
  # Main entry point for library download feature
  # See end of file for command line options
  #
  def download_entire_animation_library
    # Connect to S3 and get a listing of all objects in the animation library bucket
    bucket = Aws::S3::Bucket.new(DEFAULT_S3_BUCKET)
    animation_objects = get_animation_objects(bucket)
    info "Found #{animation_objects.size} animations."

    info "Downloading library..."

    download_progress_bar = ProgressBar.create(total: animation_objects.size) unless @options[:verbose] || @options[:quiet]

    # Parallelize downloads
    Parallel.map(animation_objects.keys, finish: lambda do |_, _, result|
      # This lambda runs synchronously after each entry is done
      if result.is_a? String
        @warnings.push result
      end
      download_progress_bar.increment unless download_progress_bar.nil?
    end
) do |name|
      # This is the parallel block.  This block should return a string to
      # generate a warning and skip the animation, and a metadata Hash in
      # the success case.
      objects = animation_objects[name]

      json_destination = File.expand_path("#{DOWNLOAD_DESTINATION}/#{objects['json'].key}")
      png_destination = File.expand_path("#{DOWNLOAD_DESTINATION}/#{objects['png'].key}")

      # Make sure there's a directory to put the downloaded files in
      `mkdir -p #{File.dirname json_destination}`

      # Download the JSON file and PNG file
      begin
        verbose "Writing #{json_destination}"
        objects['json'].get(response_target: json_destination)
        verbose "Writing #{png_destination}"
        objects['png'].get(response_target: png_destination)
      rescue Aws::Errors::ServiceError => service_error
        next <<-WARN
There was an error retrieving #{name}.json and #{name}.png from S3:
#{service_error}
The animation has been skipped.
        WARN
      end

      true
    end
    download_progress_bar.finish unless download_progress_bar.nil?

    @warnings.each {|warning| warn "#{bold 'Warning:'} #{warning}"}

    info <<-EOS.unindent
      Library downloaded to #{DOWNLOAD_DESTINATION}

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

  # Given an S3 bucket, return map of animation file objects:
  # ret_val['animation_name'] = {'json': JSON file, 'png': PNG file}
  def get_animation_objects(bucket)
    animations_by_name = {}
    bucket.objects.each do |object_summary|
      animation_name = object_summary.key[/^[^.]+/]
      extension = object_summary.key[/(?<=\.)\w+$/]
      next if extension.nil? # Skip 'directory' objects

      verbose <<-EOS.unindent
        #{bold object_summary.key}
        #{object_summary.last_modified} | #{object_summary.size}
      EOS
      # Push into animations collection if unique
      animations_by_name[animation_name] ||= {}
      if animations_by_name[animation_name][extension].nil?
        animations_by_name[animation_name][extension] = object_summary
      else
        @warnings.push "Encountered multiple objects with key #{object_summary.key} - only using the first one."
      end
    end
    animations_by_name
  end

  # Load metadata from previously-generated file, which we'll use later to
  # skip update work if it's unchanged.
  def read_old_metadata
    File.open(DEFAULT_OUTPUT_FILE, 'r') do |file|
      old_manifest = JSON.parse(file.read)

      # Build reverse alias map
      aliases_by_key = Hash.new {|h, k| h[k] = []}
      old_manifest['aliases'].each do |aliaz, keys|
        keys.each {|key| aliases_by_key[key].push(aliaz)}
      end

      # Put aliases back in metadata
      return old_manifest['metadata'].hmap do |key, metadata|
        metadata['aliases'] = aliases_by_key[key]
        [key, metadata]
      end
    end
  rescue
    warn "There was a problem reading the existing manifest.  Rebuilding from scratch..."
    return {}
  end

  # Given a map of S3 objects for animations, build up an animation
  # metadata map.
  def build_animation_metadata(animation_objects, previous_metadata)
    metadata_progress_bar = ProgressBar.create(total: animation_objects.size) unless @options[:verbose] || @options[:quiet]
    animation_metadata_by_name = {}

    # Parallelize metadata construction because some objects will require an
    # extra S3 request to get version IDs or image dimensions.
    Parallel.map(animation_objects.keys, finish: lambda do |name, _, result|
      # This lambda runs synchronously after each entry is done processing - it's
      # used to collect up results and warnings to the original process/thread.
      if result.is_a? Hash
        animation_metadata_by_name[name] = result
      else
        @warnings.push result
      end
      metadata_progress_bar.increment unless metadata_progress_bar.nil?
    end
) do |name|
      # This is the parallel block.  This block should return a string to
      # generate a warning and skip the animation, and a metadata Hash in
      # the success case.
      objects = animation_objects[name]

      # Drop this animation if it is missing its JSON or PNG components
      if objects['json'].nil?
        next "Animation #{name} does not have a JSON file and was skipped."
      elsif objects['png'].nil?
        next "Animation #{name} does not have a PNG file and was skipped."
      end

      # Before we do anything else, check the last modify times on both files.
      # If they are unchanged, just use the old metadata (+aliases).
      # This saves us from actually downloading the files from S3
      if previous_metadata[name].is_a?(Hash) &&
          previous_metadata[name]['jsonLastModified'] == objects['json'].last_modified.to_s &&
          previous_metadata[name]['pngLastModified'] == objects['png'].last_modified.to_s
        verbose "#{bold name} is unchanged, using old metadata"
        next previous_metadata[name]
      end

      # Actually download the JSON from S3
      begin
        json_response = objects['json'].get
        metadata = JSON.parse(json_response.body.read)
      rescue Aws::Errors::ServiceError => service_error
        next <<-WARN
There was an error retrieving #{name}.json from S3:
#{service_error}
The animation has been skipped.
        WARN
      rescue JSON::JSONError => json_error
        next <<-WARN
There was an error parsing #{name}.json:
#{json_error}
The animation has been skipped.
        WARN
      end

      # Verify that the parsed metadata contains all expected fields
      next "Animation #{name} is missing the 'name' attribute." unless metadata['name'].is_a?(String)
      next "Animation #{name} is missing the 'frameCount' attribute." unless metadata['frameCount'].is_a?(Integer)
      next "Animation #{name} is missing the 'frameSize' attribute." unless metadata['frameSize'].is_a?(Hash)
      next "Animation #{name} is missing the 'frameSize.x' attribute." unless metadata['frameSize']['x'].is_a?(Integer)
      next "Animation #{name} is missing the 'frameSize.y' attribute." unless metadata['frameSize']['y'].is_a?(Integer)
      next "Animation #{name} is missing the 'looping' attribute." unless [TrueClass, FalseClass].include? metadata['looping'].class
      next "Animation #{name} is missing the 'frameDelay' attribute." unless metadata['frameDelay'].is_a?(Integer)

      # Add last modification time for each file to the metadata so we can skip
      # unmodified files in future manifest updates
      metadata['jsonLastModified'] = objects['json'].last_modified.to_s
      metadata['pngLastModified'] = objects['png'].last_modified.to_s

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

      metadata
    end
    metadata_progress_bar.finish unless metadata_progress_bar.nil?
    animation_metadata_by_name
  end

  # Given a metadata map, build the alias map
  def build_alias_map(animation_metadata)
    alias_progress_bar = ProgressBar.create(total: animation_metadata.size) unless @options[:quiet]
    alias_map = Hash.new {|h, k| h[k] = []}
    animation_metadata.each do |name, metadata|
      aliases = [metadata['name'].downcase]
      aliases += metadata['aliases'].map(&:downcase) unless metadata['aliases'].nil?
      aliases.each do |aliaz|
        # Push name into target array, deduplicate, and sort
        alias_map[aliaz] = (alias_map[aliaz] + [name]).uniq.sort
      end
      alias_progress_bar.increment unless alias_progress_bar.nil?
    end
    alias_progress_bar.finish unless alias_progress_bar.nil?
    alias_map.each {|k, v| verbose "#{bold k}: #{v.join(', ')}"} if @options[:verbose]
    alias_map
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

  opts.on('--download-all', "Download entire animation library to #{DOWNLOAD_DESTINATION}") do
    options[:download_all] = true
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
cli_parser.parse!(ARGV)
if options[:download_all]
  ManifestBuilder.new(options).download_entire_animation_library
else
  ManifestBuilder.new(options).rebuild_animation_library_manifest
end
