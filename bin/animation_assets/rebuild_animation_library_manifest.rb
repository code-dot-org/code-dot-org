#!/usr/bin/env ruby
#
# Regenerates an animation library manifest by reading the contents of S3 bucket
# cdo-animation-library.
#
# For usage, run ./rebuild_animation_library_manifest.rb --help
#
# The manifest has three important jobs:
# 1. Provide the metadata used to render spritesheets as animations.
# 2. Point to particular versions of the spritesheets on S3.
# 3. Provide a precomputed search tree for quick animation searches by keyword.
#
# The expected output of this file is a new animationLibrary.json which is
# consumed by the apps build.  You'll need to manually check this file into git.

require_relative './manifest_builder'
require_relative '../../lib/cdo/cdo_cli'
include CdoCli

# Parse command-line options and then start the rebuild process
options = {}
cli_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./rebuildAnimationLibraryManifest.rb [options]"
  opts.separator ""
  opts.separator "Options:"

  opts.on('-s', '--spritelab', 'Build costumeLibrary for Sprite Lab') do
    options[:spritelab] = true
  end

  opts.on('--download-all', "Download entire animation library to #{DOWNLOAD_DESTINATION}") do
    options[:download_all] = true
  end

  opts.on('-q', '--quiet', 'Only log warnings and errors') do
    options[:quiet] = true
  end

  opts.on('-v', '--verbose', 'Use verbose log output') do
    options[:verbose] = true
  end

  opts.on('-u', '--upload', 'Upload Spritelab manifest to S3') do
    options[:upload_to_s3] = true
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
