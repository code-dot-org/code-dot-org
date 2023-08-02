#!/usr/bin/env ruby

# DO NOT USE AS A REFERENCE. This misses certain behavioral
# definition names due to a bug in BEHAVIORAL_DEFINITION_NAMES's
# initialization. Use `update_behavior_blocks_ids3`.

# Behavioral blocks with no id set have their id
# set on the frontend as their text value. This causes
# issues when viewing the levels in different languages.

require_relative '../../dashboard/config/environment'

BEHAVIORAL_DEFINITION_NAMES = %w(
  driving with arrow keys
  growing
  jittering
  moving east
  moving north
  moving south
  moving west
  moving with arrow keys
  patrolling
  shrinking
  spinning left
  spinning right
  swimming left and right
  wandering
  chasing
  acting goofy
).freeze

def for_each_level_file(&block)
  Dir.glob(Rails.root.join('config/scripts/**/*.level')).sort.map(&block)
end

def level_name_from_path(path)
  File.basename(path, File.extname(path))
end

def update_behavior_blocks_ids
  updated_levels = 0
  skipped_levels = 0

  for_each_level_file do |path|
    raw_level_data = File.read(path)

    xml = Nokogiri::XML(raw_level_data, &:noblanks)
    if xml.nil?
      skipped_levels += 1
      next
    end

    # Get all gamelab_behavior_get blocks that have title texts and ids that are different
    did_skip = true
    BEHAVIORAL_DEFINITION_NAMES.each do |name|
      titles = xml.xpath("//block[@type='gamelab_behavior_get']//title[text()='#{name}'][not(@id = '#{name}')]")
      next if titles.empty?

      titles.each do |title|
        title['id'] = name
      end
      did_skip = false
    end

    if did_skip
      skipped_levels += 1
      next
    end

    raw_level_data = xml.root.to_s
    File.write(path, raw_level_data)
    updated_levels += 1
  rescue Exception => exception
    # print filename for better debugging
    new_e = Exception.new("in level: #{path}: #{exception.message}")
    new_e.set_backtrace(exception.backtrace)
    raise new_e
  end

  puts "#{skipped_levels} level files didn't need updating"
  puts "#{updated_levels} level files that had a behavior_definition title updated"
end

update_behavior_blocks_ids
