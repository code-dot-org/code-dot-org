#!/usr/bin/env ruby

# wandering behavioral blocks with no id set have their id
# set on the frontend as their text value. This causes issues
# when viewing the levels in different languages.

require_relative '../../dashboard/config/environment'

def for_each_level_file(&block)
  Dir.glob(Rails.root.join('config/scripts/**/*.level')).sort.map(&block)
end

def level_name_from_path(path)
  File.basename(path, File.extname(path))
end

def update_wandering_behavior_blocks
  updated_levels = 0
  skipped_levels = 0

  for_each_level_file do |path|
    raw_level_data = File.read(path)

    xml = Nokogiri::XML(raw_level_data, &:noblanks)
    if xml.nil?
      skipped_levels += 1
      next
    end

    # Get all behavior_definition blocks that have "wandering" as their title text and id not set to "wandering"
    titles = xml.xpath("//block[@type='behavior_definition']//title[text()='wandering'][not(@id = 'wandering')]")
    if titles.empty?
      skipped_levels += 1
      next
    end

    titles.each do |title|
      title['id'] = 'wandering'
    end

    raw_level_data = xml.root.to_s
    File.write(path, raw_level_data)
    updated_levels += 1
  rescue Exception => e
    # print filename for better debugging
    new_e = Exception.new("in level: #{path}: #{e.message}")
    new_e.set_backtrace(e.backtrace)
    raise new_e
  end

  puts "#{skipped_levels} level files didn't need updating"
  puts "#{updated_levels} level files that had a wandering behavior_definition title updated"
end

update_wandering_behavior_blocks
