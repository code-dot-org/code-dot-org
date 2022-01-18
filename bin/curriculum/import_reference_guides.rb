#!/usr/bin/env ruby

require 'json'
require 'optparse'
require 'uri'
require 'net/http'
require_relative '../../deployment'
require 'cdo/lesson_import_helper'

raise unless [:development, :adhoc, :levelbuilder].include? rack_env

$verbose = false
def log(str)
  puts str if $verbose
end

$quiet = false
def warn(str)
  puts str unless $quiet && !$verbose
end

# Wait until after initial error checking before loading the rails environment.
def require_rails_env
  log "loading rails environment..."
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  log "rails environment loaded in #{(Time.now - start_time).to_i} seconds."
end

def parse_options
  OpenStruct.new.tap do |options|
    options.local = false
    options.dry_run = false

    opt_parser = OptionParser.new do |opts|
      opts.banner = <<~BANNER

        Usage: #{$0} [options]
      BANNER

      opts.separator ""

      opts.on('-l', '--local', 'Use local curriculum builder running on localhost:8000.') do
        options.local = true
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without importing any data.') do
        options.dry_run = true
      end

      opts.on('-q', '--quiet', 'Silence warnings.') do
        $quiet = true
      end

      opts.on('-v', '--verbose', 'Use verbose debug logging.') do
        $verbose = true
      end

      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end
    end

    opt_parser.parse!(ARGV)
  end
end

def main(options)
  cb_url_prefix = options.local ? 'http://localhost:8000' : 'http://www.codecurricula.com'

  # recursively find all the maps!
  map_stack = ['concepts']
  updated_reference_guide_count = 0

  until map_stack.empty?
    map_to_fetch = map_stack.pop

    puts "Fetching #{map_to_fetch}"

    url = "#{cb_url_prefix}/documentation/export/#{map_to_fetch}.json?format=json"
    map_json = fetch(url)

    map = JSON.parse(map_json)
    updated_reference_guide_count += 1

    map_stack.concat(map['children'])

    next if options.dry_run

    # <CourseVersion id: 107, key: "2022", display_name: "2022"...
    default_course_version = CourseVersion.find_by(id: 107)

    reference_guide = ReferenceGuide.find_or_initialize_by(
      {
        name: map['title'],
        slug: map['slug'],
        content: map['content'],
      }
    )
    reference_guide.course_version = default_course_version
    reference_guide.save! if reference_guide.changed?
    reference_guide.write_serialization
  end

  puts "updated #{updated_reference_guide_count} reference guides"
end

def fetch(url)
  uri = URI(url)
  response = Net::HTTP.get_response(uri)
  raise "HTTP status #{response.code} fetching #{uri}" unless response.is_a? Net::HTTPSuccess
  body = response.body
  log "fetched #{body.length} bytes of unit json from #{uri}"
  body
end

options = parse_options

require_rails_env
main(options)
