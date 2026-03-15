#!/usr/bin/env -S bundle exec ruby
# frozen_string_literal: true

require 'optparse'
require 'pathname'

require_relative 'src/cache_miss_test_plan_support'

SCRIPT_DIR = Pathname(__dir__).realpath
INPUT_PATH = SCRIPT_DIR / 'daily-odds-of-file-change.json'
OUTPUT_PATH = SCRIPT_DIR / 'cache-miss-test-plan.json'
DEFAULT_TEST_DAYS = 10

def parse_options
  options = {test_days: DEFAULT_TEST_DAYS}

  OptionParser.new do |parser|
    parser.banner = 'Usage: generate-cache-miss-test-plan.rb [--test-days=N]'
    parser.on('--test-days=N', Integer, 'Number of virtual test days to generate') do |days|
      raise OptionParser::InvalidArgument, 'test days must be positive' unless days.positive?

      options[:test_days] = days
    end
  end.parse!

  options
end

def build_plan(path_entries, test_days)
  (1..test_days).map do |day|
    modify_paths = path_entries.filter_map do |entry|
      entry.fetch('path_to_modify_to_trigger_cache_miss') if rand < entry.fetch('odds_of_a_cache_miss')
    end.uniq.sort

    {
      'day' => day,
      'modify_paths' => modify_paths
    }
  end
end

def main
  options = parse_options
  rows = CacheMissTestPlanSupport.load_json_array(INPUT_PATH)
  path_entries = CacheMissTestPlanSupport.collapse_copy_paths(rows)
  plan = build_plan(path_entries, options.fetch(:test_days))
  CacheMissTestPlanSupport.write_pretty_json(OUTPUT_PATH, plan)

  puts "Wrote test plan:\n  #{OUTPUT_PATH}"
end

main if $PROGRAM_NAME == __FILE__
