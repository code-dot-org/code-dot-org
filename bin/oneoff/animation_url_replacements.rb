#!/usr/bin/env ruby

# One-off: replace specific start_animations sourceUrl values in Gamelab levels
# - Reads mapping from a CSV file with columns: old_url,new_url
# - Exact string match only (no proxy unwrapping)
# - Prints each successful change
# - Idempotent: only updates when the value differs
#
# Run:
#   bin/rails runner bin/oneoff/animation_url_replacements.rb
#   # or if executable:
#   ./bin/oneoff/animation_url_replacements.rb

require_relative '../../dashboard/config/environment'
require 'json'
require 'csv'

DRY_RUN  = true
CSV_PATH = 'bin/oneoff/animation_url_replacements.csv'

def load_mapping_from_csv(path)
  mapping = {}

  CSV.foreach(path, headers: true) do |row|
    old_url = (row['old_url'] || row[0]).to_s.strip
    new_url = (row['new_url'] || row[1]).to_s.strip
    next if old_url.empty? || new_url.empty?
    mapping[old_url] = new_url
  end

  mapping
end

def animation_url_replacements
  mapping = load_mapping_from_csv(CSV_PATH)

  puts DRY_RUN ? "THIS IS A DRY RUN" : "THIS IS A FULL RUN"
  puts "Mappings loaded: #{mapping.size} (from #{CSV_PATH})"

  total_levels       = 0
  modified_levels    = 0
  total_replacements = 0
  bad_json_levels    = 0

  Gamelab.all.each do |level|
    next unless level.start_animations

    total_levels += 1

    begin
      modified_this_level = false

      animations = JSON.parse(level.start_animations)
      props_by_key = animations['propsByKey'] || {}

      props_by_key.each_value do |props|
        next unless props.is_a?(Hash) && props['sourceUrl'].is_a?(String)

        current_url = props['sourceUrl']
        next unless mapping.key?(current_url)

        new_url = mapping[current_url]

        puts "[updated #{props['name']} in #{level.name}]"

        props['sourceUrl'] = new_url

        total_replacements += 1
        modified_this_level = true
      end

      if modified_this_level
        animations['propsByKey'] = props_by_key
        level.start_animations = JSON.pretty_generate(animations)
        level.save!(touch: false) unless DRY_RUN
        modified_levels += 1
      end
    rescue
      puts "Failed to process #{level.name} due to bad JSON"
      bad_json_levels += 1
    end
  end

  puts "\n--- SUMMARY ---"
  puts "Levels processed:        #{total_levels}"
  puts "Levels modified:         #{modified_levels}"
  puts "Total replacements:      #{total_replacements}"
  puts "Bad JSON levels:         #{bad_json_levels}"
  puts DRY_RUN ? "NO CHANGES WERE SAVED" : "CHANGES WERE SAVED"
end

animation_url_replacements
