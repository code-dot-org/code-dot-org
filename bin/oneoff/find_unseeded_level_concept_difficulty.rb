#!/usr/bin/env ruby

# This script scans all .level files for levels that should have
# LevelConceptDifficulty records, locates the associated levels,
# and checks to see if the seeded LevelConceptDifficulty matches
# what the .level file specifies.
#
# Used to check for production impact of a small seeding bug, fixed by
# https://github.com/code-dot-org/code-dot-org/pull/24034

require_relative '../../dashboard/config/environment'

def for_each_level_file(&block)
  Dir.glob(Rails.root.join('config/scripts/**/*.level')).sort.map(&block)
end

def level_name_from_path(path)
  File.basename(path, File.extname(path))
end

def find_mismatched_levels
  skipped_because_no_lcd = 0
  matching_levels = 0
  mismatched_levels = []

  for_each_level_file do |path|
    level_name = level_name_from_path path
    raw_level_data = File.read path
    unless raw_level_data.include? 'level_concept_difficulty'
      skipped_because_no_lcd += 1
      next
    end

    xml_node = Nokogiri::XML(raw_level_data, &:noblanks)
    level_attributes = JSON.parse(xml_node.xpath('//../config').first.text)
    expected_lcd = level_attributes['level_concept_difficulty']&.symbolize_keys
    next unless expected_lcd

    actual_level = Level.find_by_name level_name
    actual_lcd = actual_level&.level_concept_difficulty
    next unless actual_lcd

    mismatched = ConceptDifficulties::CONCEPTS.any? do |concept|
      expected_lcd[concept.to_sym] != actual_lcd[concept.to_sym]
    end

    if mismatched
      mismatched_levels << path
      puts "Found mismatch: #{level_name}"
      puts "Expected: #{expected_lcd}"
      puts "Actual: #{actual_lcd.attributes.slice(*ConceptDifficulties::CONCEPTS).select {|_, v| v.present?}}"
    else
      matching_levels += 1
    end
  rescue Exception => e
    # print filename for better debugging
    new_e = Exception.new("in level: #{path}: #{e.message}")
    new_e.set_backtrace(e.backtrace)
    raise new_e
  end

  puts "#{skipped_because_no_lcd} level files didn't specify LevelConceptDifficulty"
  puts "#{matching_levels} level files matched the seeded LevelConceptDifficulty"
  puts "#{mismatched_levels.count} level files DID NOT match the seeded LevelConceptDifficulty"
  mismatched_levels
end

puts find_mismatched_levels
