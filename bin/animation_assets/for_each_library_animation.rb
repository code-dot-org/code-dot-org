#!/usr/bin/env ruby
#
# Makes a change to every animation in the animation library on S3.

require 'aws-sdk-s3'
require 'ruby-progressbar'
require_relative '../../deployment'
require_relative '../../lib/cdo/cdo_cli'
include CdoCli

DEFAULT_S3_BUCKET = 'cdo-animation-library'.freeze

class AnimationIterator
  def initialize(options)
    @options = options
  end

  def iterate_animations
    bucket = Aws::S3::Bucket.new(DEFAULT_S3_BUCKET)

    # Get all object summaries first, so we can know the total collection size
    summaries = []
    bucket.objects.each {|object_summary| summaries.push object_summary}

    progress_bar = ProgressBar.create(total: summaries.size)
    summaries.each do |object_summary|
      extension = object_summary.key[/(?<=\.)\w+$/]
      next unless extension == 'json'

      # Parse JSON, change looping to TRUE, replace object
      object = object_summary.get
      begin
        parsed = JSON.parse object.body.read
        parsed['looping'] = true
        new_body = JSON.pretty_generate parsed
        object_summary.put({body: new_body})
        progress_bar.increment
      rescue JSON::JSONError
        progress_bar.increment
        next
      end
    end
    progress_bar.finish

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

# Parse command-line options and then start the process
options = {}
cli_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./forEachLibraryAnimation.rb [options]"
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

puts <<-NOTE
This script is checked in for archival purposes.

It was originally designed as a one-use update to all the animation library
metadata on S3, to set "looping": true in every metadata file.

If you'd like to use it, you'll need to open it up and re-enable its behavior.
NOTE
exit(0)
AnimationIterator.new(options).iterate_animations
