#!/usr/bin/env ruby
#
require_relative '../../dashboard/config/environment'
require_relative '../../lib/analyze_hoc_activity_helper'
require 'json'

def print_usage_and_exit(code: 0)
  puts "USAGE: rank_tutorials [end_date in %Y-%m-%d format]"
  puts "\tend_date defaults to today"
  puts "\tie: rank_tutorials 2016-11-30"
  exit(code)
end

if ARGV.include?("--help") || ARGV.include?("-h")
  print_usage_and_exit
end

begin
  end_date = ARGV.empty? ? Date.today : Date.strptime(ARGV[0], '%Y-%m-%d')
rescue ArgumentError
  print_usage_and_exit(code: 1)
end

puts JSON.pretty_generate(rank_tutorials(end_date))
