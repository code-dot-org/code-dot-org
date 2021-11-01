#!/usr/bin/env ruby

# This script scans all .level files for mutation blocks
# containing attribute "counter" with value "counter".
# These are being removed because the language for that
# variable is being hardcoded not allowing for translation.
# More here: https://github.com/code-dot-org/code-dot-org/pull/42458

require_relative '../../dashboard/config/environment'

def for_each_level_file(&block)
  Dir.glob(Rails.root.join('config/scripts/**/*.level')).sort.map(&block)
end

def level_name_from_path(path)
  File.basename(path, File.extname(path))
end

def remove_controls_for_counter_mutations
  updated_levels = 0
  skipped_levels = 0

  for_each_level_file do |path|
    raw_level_data = File.read(path)

    unless raw_level_data.include? 'mutation'
      skipped_levels += 1
      next
    end

    xml = Nokogiri::XML(raw_level_data, &:noblanks)
    if xml.nil?
      skipped_levels += 1
      next
    end

    mutations = xml.xpath("//block[@type='controls_for_counter']//mutation[@counter='counter']")
    if mutations.empty?
      skipped_levels += 1
      next
    end

    mutations.each(&:remove)
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
  puts "#{updated_levels} level files that had a controls_for_counter mutation removed"
end

remove_controls_for_counter_mutations
