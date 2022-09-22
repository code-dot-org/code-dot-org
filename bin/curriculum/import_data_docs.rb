#!/usr/bin/env ruby

require 'set'
require 'json'
require 'optparse'
require 'uri'
require 'net/http'
require_relative '../../deployment'

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

  # recursively find all the data docs!
  data_doc_slug_stack = ['concepts/data-library']
  data_doc_key_set = Set[]
  data_doc_count = 0

  until data_doc_slug_stack.empty?
    current_slug = data_doc_slug_stack.pop

    # only import Data Docs
    # next unless current_slug.start_with?('concepts/data-library')

    url = "#{cb_url_prefix}/documentation/export/#{current_slug}.json?format=json"
    guide_json = fetch(url)

    guide = JSON.parse(guide_json)

    # find a unique key based on the end of the slug
    # if there are duplicates, append -N where N is a number that makes it unique
    key_base = guide['slug'].rpartition('/').last

    unique_key = key_base
    iteration = 2
    while data_doc_key_set.include?(unique_key)
      unique_key = "#{key_base}-#{iteration}"
      iteration += 1
    end

    # don't reuse that key
    data_doc_key_set.add(unique_key)

    # store the children with their parent key because we only want its children
    data_doc_slug_stack.concat(guide['children'])

    # skip serializing the 'concepts/data-library' map
    next if guide['slug'] == 'concepts/data-library'

    next if options.dry_run

    data_doc = DataDoc.find_or_initialize_by(
      {
        key: unique_key,
      }
    )

    data_doc.name = guide['title']
    data_doc.content = guide['content']

    data_doc.save!
    data_doc.write_serialization

    data_doc_count += 1
  end

  puts "imported #{data_doc_count} data docs"
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
