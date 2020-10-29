#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require 'json'
require 'cdo/chat_client'

PALLY_PATH = File.expand_path("../../../../apps/node_modules/pa11y-ci/bin/pa11y-ci.js", __FILE__)
CONFIG_PATH = File.expand_path("../config.json", __FILE__)

def main
  ChatClient.message 'wcag-checker', 'Scanning for Accessibility Errors and Warnings using WCAG2AA standard using PA11Y tool {http://pa11y.org}'

  # call pa11y
  `#{PALLY_PATH} -j -c #{CONFIG_PATH} > pa11y_log.json`

  file = File.read('pa11y_log.json')
  file_hash = JSON.parse(file)

  summary = "Found #{file_hash['errors']} errors across #{file_hash['total']} urls"

  ChatClient.message 'wcag-checker', summary

  # Get urls we ran this on
  urls = File.read(CONFIG_PATH)
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

    ChatClient.message 'wcag-checker', "Most Common Errors for #{url}:"
    error_results.each do |error, count|
      ChatClient.message 'wcag-checker', "  #{error} - #{count}"
    end
  end
end

main
