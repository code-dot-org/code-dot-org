#!/usr/bin/env ruby
#
# Regenerates a sound library manifest by reading the contents of S3 bucket
# cdo-sound-library.
# Adapted from rebuildAnimationLibraryManifest.rb
#
# For usage, run ./rebuildSoundLibraryManifest.rb --help
#
# The manifest has three important jobs:
# 1. Provide the metadata used to categorize and display sound information.
# 2. Point to particular versions of the sounds on S3.
# 3. Provide a precomputed search tree for quick sound searches by keyword.
#
# The expected output of this file is a new soundLibrary.json which is
# consumed by the apps build.  You'll need to manually check this file into git.
#
# See also: The Sound Library Tech Spec (requires login):
# https://docs.google.com/document/d/1Oj--H-xwrK3u4A0L5ML73n8XDutsH5n2i8caGRc3NL8/edit
require 'aws-sdk-s3'
require 'ruby-progressbar'
require 'optparse'
require 'parallel'
require_relative '../../deployment'
require_relative '../../lib/cdo/cdo_cli'
include CdoCli

DEFAULT_S3_BUCKET = 'cdo-sound-library'.freeze
DEFAULT_OUTPUT_FILE = "#{`git rev-parse --show-toplevel`.strip}/apps/src/code-studio/soundLibrary.json".freeze
DOWNLOAD_DESTINATION = '~/cdo-sound-library'.freeze

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
  def rebuild_sound_library_manifest
    # Connect to S3 and get a listing of all objects in the sound library bucket
    bucket = Aws::S3::Bucket.new(DEFAULT_S3_BUCKET)
    sound_objects = get_sound_objects(bucket)
    info "Found #{sound_objects.size} sounds."

    info "Building sound metadata..."
    sound_metadata = build_sound_metadata(sound_objects, read_old_metadata)
    info "Metadata built for #{sound_metadata.size} sounds."

    info "Building alias map..."
    alias_map = build_alias_map(sound_metadata)
    info "Mapped #{alias_map.size} aliases."

    info "Building category map..."
    category_map = build_category_map(sound_metadata)
    info "Mapped #{category_map.size} categories"

    # Write result to file
    File.open(DEFAULT_OUTPUT_FILE, 'w') do |file|
      file.write(
        JSON.pretty_generate(
          {
            # JSON-style file comment
            '//': [
              'Sound Library Manifest',
              'GENERATED FILE: DO NOT MODIFY DIRECTLY',
              'See tools/scripts/rebuildSoundLibraryManifest.rb for more information.'
            ],

            # Strip aliases from metadata - they're no longer needed since they
            #   are represented in the alias map.
            # Also sort for stable updates
            'metadata': sound_metadata.hmap {|k, v| [k, v.omit!('aliases')]}.sort.to_h,

            # Sort category map for stable updates
            'categories': category_map.sort.to_h,

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
  def download_entire_sound_library
    # Connect to S3 and get a listing of all objects in the sound library bucket
    bucket = Aws::S3::Bucket.new(DEFAULT_S3_BUCKET)
    sound_objects = get_sound_objects(bucket)
    info "Found #{sound_objects.size} sounds."

    info "Downloading library..."

    download_progress_bar = ProgressBar.create(total: sound_objects.size) unless @options[:verbose] || @options[:quiet]

    # Parallelize downloads
    Parallel.map(sound_objects.keys, finish: lambda do |_, _, result|
      # This lambda runs synchronously after each entry is done
      if result.is_a? String
        @warnings.push result
      end
      download_progress_bar.increment unless download_progress_bar.nil?
    end
) do |name|
      # This is the parallel block.  This block should return a string to
      # generate a warning and skip the sound, and a metadata Hash in
      # the success case.
      objects = sound_objects[name]

      json_destination = File.expand_path("#{DOWNLOAD_DESTINATION}/#{objects['json'].key}")
      mp3_destination = File.expand_path("#{DOWNLOAD_DESTINATION}/#{objects['mp3'].key}")

      # Make sure there's a directory to put the downloaded files in
      `mkdir -p #{File.dirname json_destination}`

      # Download the JSON file and MP3 file
      begin
        verbose "Writing #{json_destination}"
        objects['json'].get(response_target: json_destination)
        verbose "Writing #{mp3_destination}"
        objects['mp3'].get(response_target: mp3_destination)
      rescue Aws::Errors::ServiceError => service_error
        next <<-WARN
There was an error retrieving #{name}.json and #{name}.mp3 from S3:
#{service_error}
The sound has been skipped.
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

  # Given an S3 bucket, return map of sound file objects:
  # ret_val['sound_name'] = {'json': JSON file, 'mp3': MP3 file}
  def get_sound_objects(bucket)
    sounds_by_name = {}
    bucket.objects.each do |object_summary|
      sound_name = object_summary.key[/^[^.]+/]
      extension = object_summary.key[/(?<=\.)\w+$/]
      next if extension.nil? # Skip 'directory' objects

      verbose <<-EOS.unindent
        #{bold object_summary.key}
        #{object_summary.last_modified} | #{object_summary.size}
      EOS
      # Push into sounds collection if unique
      sounds_by_name[sound_name] ||= {}
      if sounds_by_name[sound_name][extension].nil?
        sounds_by_name[sound_name][extension] = object_summary
      else
        @warnings.push "Encountered multiple objects with key #{object_summary.key} - only using the first one."
      end
    end
    sounds_by_name
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

  # Given a map of S3 objects for sounds, build up an sound
  # metadata map.
  def build_sound_metadata(sound_objects, previous_metadata)
    metadata_progress_bar = ProgressBar.create(total: sound_objects.size) unless @options[:verbose] || @options[:quiet]
    sound_metadata_by_name = {}

    # Parallelize metadata construction because some objects will require an
    # extra S3 request to get version IDs or image dimensions.
    Parallel.map(sound_objects.keys, finish: lambda do |name, _, result|
      # This lambda runs synchronously after each entry is done processing - it's
      # used to collect up results and warnings to the original process/thread.
      if result.is_a? Hash
        sound_metadata_by_name[name] = result
      else
        @warnings.push result
      end
      metadata_progress_bar.increment unless metadata_progress_bar.nil?
    end
) do |name|
      # This is the parallel block.  This block should return a string to
      # generate a warning and skip the sound, and a metadata Hash in
      # the success case.
      objects = sound_objects[name]

      # Drop this sound if it is missing its JSON or MP3 components
      if objects['json'].nil?
        next "sound #{name} does not have a JSON file and was skipped."
      elsif objects['mp3'].nil?
        next "sound #{name} does not have a MP3 file and was skipped."
      end

      # Before we do anything else, check the last modify times on both files.
      # If they are unchanged, just use the old metadata (+aliases).
      # This saves us from actually downloading the files from S3
      if previous_metadata[name].is_a?(Hash) &&
          previous_metadata[name]['jsonLastModified'] == objects['json'].last_modified.to_s &&
          previous_metadata[name]['mp3LastModified'] == objects['mp3'].last_modified.to_s
        verbose "#{bold name} is unchanged, using old metadata"
        next previous_metadata[name]
      end

      # Actually download the JSON from S3
      begin
        json_response = objects['json'].get
        metadata = JSON.parse(json_response.body.read)
        aliases = metadata['aliases']
        # move categories out of aliases
        categories = []
        aliases.each do |a|
          if a.start_with? "category_"
            categories.push (a.delete_prefix "category_")
          end
        end
        metadata['aliases'] = aliases.map {|a| (a.start_with? "category_") ? (a.delete_prefix "category_") : a}
        metadata['categories'] = categories
      rescue Aws::Errors::ServiceError => service_error
        next <<-WARN
There was an error retrieving #{name}.json from S3:
#{service_error}
The sound has been skipped.
        WARN
      rescue JSON::JSONError => json_error
        next <<-WARN
There was an error parsing #{name}.json:
#{json_error}
The sound has been skipped.
        WARN
      end

      # Verify that the parsed metadata contains all expected fields
      next "sound #{name} is missing the 'name' attribute." unless metadata['name'].is_a?(String)
      next "sound #{name} is missing the 'time' attribute." unless metadata['time'].is_a?(Integer)

      # Add last modification time for each file to the metadata so we can skip
      # unmodified files in future manifest updates
      metadata['jsonLastModified'] = objects['json'].last_modified.to_s
      metadata['mp3LastModified'] = objects['mp3'].last_modified.to_s

      # Record target version in the metadata, so environments (and projects)
      # consistently reference the version they originally imported.
      metadata['version'] = objects['mp3'].object.version_id

      # Generate appropriate sourceUrl pointing to the sound library API
      metadata['sourceUrl'] = "/api/v1/sound-library/#{name}.mp3"

      verbose <<-EOS
#{bold name} @ #{metadata['version']}
#{JSON.pretty_generate metadata}
      EOS

      metadata
    end
    metadata_progress_bar.finish unless metadata_progress_bar.nil?
    sound_metadata_by_name
  end

  # Given a metadata map, build the alias map
  def build_alias_map(sound_metadata)
    alias_progress_bar = ProgressBar.create(total: sound_metadata.size) unless @options[:quiet]
    alias_map = Hash.new {|h, k| h[k] = []}
    sound_metadata.each do |name, metadata|
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

  # Given a metadata map, build the category map
  def build_category_map(sound_metadata)
    category_progress_bar = ProgressBar.create(total: sound_metadata.size) unless @options[:quiet]
    category_map = Hash.new {|h, k| h[k] = []}
    sound_metadata.each do |name, metadata|
      categories = metadata['categories']
      categories.each do |category|
        category_map[category] = (category_map[category] + [name]).uniq.sort
      end
      category_progress_bar.increment unless category_progress_bar.nil?
    end
    category_progress_bar.finish unless category_progress_bar.nil?
    category_map
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
  opts.banner = "Usage: ./rebuildSoundLibraryManifest.rb [options]"
  opts.separator ""
  opts.separator "Options:"

  opts.on('--download-all', "Download entire sound library to #{DOWNLOAD_DESTINATION}") do
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
  ManifestBuilder.new(options).download_entire_sound_library
else
  ManifestBuilder.new(options).rebuild_sound_library_manifest
end
