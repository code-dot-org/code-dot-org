#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/only_one'
require 'json'

PALLY_PATH = "../../../apps/node_modules/pa11y-ci/bin/pa11y-ci.js"
CONFIG_PATH = "./config.json"

def main
  puts "Scanning for Accessibility Errors and Warnings"
  puts "Using WCAG2A standard using PA11Y tool {http://pa11y.org}"
  puts "JSON output in pa11y_log.txt"

  # call pa11y
  `#{PALLY_PATH} -j -c #{CONFIG_PATH} > pa11y_log.txt`
end

main if only_one_running?(__FILE__)
