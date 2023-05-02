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
  # recursively find all the data docs using a stack
  data_doc_path_stack = ['concepts/data-library']
  data_doc_count = 0

  until data_doc_path_stack.empty?
    current_path = data_doc_path_stack.pop
    url = "http://www.codecurricula.com/documentation/export/#{current_path}.json?format=json"
    guide_json = fetch(url)
    guide = JSON.parse(guide_json)

    key = guide['slug'].rpartition('/').last

    data_doc_path_stack.concat(guide['children'])

    # skip serializing the 'concepts/data-library' map, as we only want its children
    next if guide['slug'] == 'concepts/data-library'

    next if options.dry_run

    data_doc = DataDoc.find_or_initialize_by(
      {
        key: key,
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
