#!/usr/bin/env ruby
# frozen_string_literal: true

# Migrate missing BubbleChoice properties from 2025 DSL files to their
# 2026 and 2025_v2 counterparts.
#
# The BubbleChoiceDSL.serialize method had a bug that omitted 7 properties
# when cloning curriculum. This script copies those properties from the
# 2025 source files to cloned targets.
#
# Usage:
#   ruby bin/oneoff/migrate_bubble_choice_properties.rb          # dry run
#   ruby bin/oneoff/migrate_bubble_choice_properties.rb --write  # apply changes

SCRIPTS_DIR = File.expand_path('../../dashboard/config/scripts', __dir__)
WRITE_MODE = ARGV.include?('--write')

PROPERTIES = %w[uses_lab2 hide_letters_lab2 custom_mode navigation_type standalone finish_dialog hide_share_and_remix].freeze
PROPERTY_REGEX = /\A(#{PROPERTIES.join('|')})(\s+'[^']*')?\s*\z/
CANONICAL_ORDER = %w[custom_mode uses_lab2 hide_letters_lab2 standalone navigation_type finish_dialog hide_share_and_remix].freeze

def extract_properties(content)
  content.lines.filter_map do |line|
    stripped = line.strip
    stripped.match?(PROPERTY_REGEX) ? stripped : nil
  end
end

def find_counterparts(source_path)
  base = source_path.sub(/_2025\.bubble_choice$/, '')
  targets = Dir.glob("#{base}_2026*.bubble_choice") +
    Dir.glob("#{base}_2025_v2*.bubble_choice")
  targets.sort
end

def sort_properties(props)
  props.sort_by {|p| CANONICAL_ORDER.index(p.split(/\s+/).first) || 999}
end

def append_properties(target_content, missing_props)
  sorted = sort_properties(missing_props)
  target_content.rstrip + "\n\n" + sorted.join("\n") + "\n"
end

# --- Main ---

puts WRITE_MODE ? "=== WRITE MODE ===" : "=== DRY RUN === (pass --write to apply changes)"
puts

source_files = Dir.glob(File.join(SCRIPTS_DIR, '*_2025.bubble_choice')).sort
stats = {scanned: 0, counterparts: 0, updated: 0, up_to_date: 0, no_counterpart: 0, no_props: 0, errors: 0}

source_files.each do |source_path|
  stats[:scanned] += 1
  source_name = File.basename(source_path)

  begin
    source_content = File.read(source_path)
    source_props = extract_properties(source_content)

    if source_props.empty?
      stats[:no_props] += 1
      next
    end

    counterparts = find_counterparts(source_path)
    if counterparts.empty?
      stats[:no_counterpart] += 1
      next
    end

    counterparts.each do |target_path|
      stats[:counterparts] += 1
      target_name = File.basename(target_path)
      target_content = File.read(target_path)
      target_props = extract_properties(target_content)
      target_keywords = target_props.map {|p| p.split(/\s+/).first}

      missing = source_props.reject {|p| target_keywords.include?(p.split(/\s+/).first)}
      if missing.empty?
        stats[:up_to_date] += 1
        puts "[skip] #{target_name} (already has all properties)"
        next
      end

      new_content = append_properties(target_content, missing)
      puts "[update] #{source_name} -> #{target_name}"
      missing.each {|p| puts "           + #{p}"}

      if WRITE_MODE
        File.write(target_path, new_content)
        stats[:updated] += 1
      end
    end
  rescue => exception
    stats[:errors] += 1
    puts "[error] #{source_name}: #{exception.message}"
  end
end

puts
puts "--- Summary ---"
puts "Source files scanned:       #{stats[:scanned]}"
puts "  with target properties:   #{stats[:scanned] - stats[:no_props]}"
puts "  without target properties:#{stats[:no_props]}"
puts "Counterpart files found:    #{stats[:counterparts]}"
puts "  needing update:           #{WRITE_MODE ? stats[:updated] : stats[:counterparts] - stats[:up_to_date]}"
puts "  already up-to-date:       #{stats[:up_to_date]}"
puts "No counterpart found:       #{stats[:no_counterpart]}"
puts "Errors:                     #{stats[:errors]}"
puts
puts WRITE_MODE ? "CHANGES WRITTEN TO DISK" : "DRY RUN - no files were modified"
