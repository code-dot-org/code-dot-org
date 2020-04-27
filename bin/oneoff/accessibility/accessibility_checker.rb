#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/only_one'
require 'json'

PALLY_PATH = "../../../apps/node_modules/pa11y-ci/bin/pa11y-ci.js"
CONFIG_PATH = "./config.json"

def main
  puts "Scanning for Accessibility Errors and Warnings"
  puts "Using WCAG2AA standard using PA11Y tool {http://pa11y.org}"
  puts "JSON output in pa11y_log.json"

  # call pa11y
  `#{PALLY_PATH} -j -c #{CONFIG_PATH} > pa11y_log.json`

  file = File.read('pa11y_log.json')
  file_hash = JSON.parse(file)

  puts ""
  puts "Found #{file_hash['errors']} errors across #{file_hash['total']} urls"

  # Get urls we ran this on
  urls = File.read('config.json')
  urls_hash = JSON.parse(urls)['urls']

  # For each url, find the most frequent errors
  urls_hash.each do |url|
    code_org_results = file_hash['results'][url]
    error_results = {}

    # Loop over all the results to count
    code_org_results.each do |result|
      code = result['code']
      # Add code or increment count of code
      error_results[code] = error_results[code].nil? ? 1 : error_results[code] + 1
    end

    # Sort from most to least frequent errors
    error_results = error_results.sort_by {|_, count| -count}

    puts ""
    puts "Most Common Errors for #{url}:"
    puts error_results
  end
end

main if only_one_running?(__FILE__)
