#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/only_one'
require 'json'

PALLY_PATH = "../../../apps/node_modules/pa11y-ci/bin/pa11y-ci.js"
CONFIG_PATH = "./config.json"

def main
  puts "Scanning for Accessibility Errors and Warnings"
  puts "Using WCAG2A standard using PA11Y tool {http://pa11y.org}"
  puts "JSON output in pa11y_log.json"

  # call pa11y
  `#{PALLY_PATH} -j -c #{CONFIG_PATH} > pa11y_log.json`

  file = File.read('pa11y_log.json')
  file_hash = JSON.parse(file)

  puts ""
  puts "Found #{file_hash["errors"]} errors across #{file_hash["total"]} files"

  urls = File.read('config.json')
  urls_hash = JSON.parse(urls)["urls"]

  urls_hash.each do |url|
    # most frequent error
    # TODO - make this extensible over all the urls
    code_org_results = file_hash["results"][url]
    error_results = {}

    # loop over all the results to count
    code_org_results.each do |result|
      code = result["code"]
      # Add code or increment count of code
      if error_results[code] == nil
        error_results[code] = 1
      else
        error_results[code] = error_results[code] + 1
      end
    end

    puts ""
    puts "Most Common Errors for #{url}:"

    error_results = error_results.sort_by {|type, count| -count}
    puts error_results
  end


end

main if only_one_running?(__FILE__)
