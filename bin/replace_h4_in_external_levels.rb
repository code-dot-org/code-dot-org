#!/usr/bin/env ruby
# Replaces h4 usage in .external DSL level files:
#   - #### text      →  text       (strips markdown h4 prefix)
#   - * #### text    →  * text     (strips h4 prefix after bullet marker)
#   - <h4...>text</h4>  →  <p>text</p>
#   - <a...><h4>text</h4></a>  →  <a...>text</a>  (unwrap only, <p> inside <a> is invalid)
#
# Only transforms content inside markdown <<MARKDOWN ... MARKDOWN heredoc blocks.
# Run from repo root: ruby bin/replace_h4_in_external_levels.rb [--dry-run]

dry_run = ARGV.include?('--dry-run')
files = Dir.glob(File.join(__dir__, '../dashboard/config/scripts/**/*.external')).sort

changed = 0
files.each do |file|
  content = File.read(file)
  original = content.dup

  content.gsub!(/^(markdown <<MARKDOWN\n)(.*?)(\nMARKDOWN)/m) do
    prefix   = Regexp.last_match(1)
    markdown = Regexp.last_match(2)
    suffix   = Regexp.last_match(3)

    # Strip exactly 4 leading # (not 5+) after optional bullet marker and whitespace.
    markdown.gsub!(/^(\s*[-*]\s*)####(?!#) */, '\1')
    markdown.gsub!(/^####(?!#) */, '')

    # Unwrap <h4> nested directly inside <a> — replacing with <p> would be invalid HTML.
    markdown.gsub!(/<a([^>]*)>\s*<h4[^>]*>(.*?)<\/h4>\s*<\/a>/m, '<a\1>\2</a>')

    # Replace remaining <h4...>...</h4> with <p>...</p>, dropping any attributes.
    markdown.gsub!(/<h4[^>]*>(.*?)<\/h4>/m, '<p>\1</p>')

    "#{prefix}#{markdown}#{suffix}"
  end

  next if content == original

  changed += 1
  if dry_run
    puts "=== #{File.basename(file)} ==="
    original.lines.zip(content.lines).each_with_index do |(orig, updated), i|
      next if orig == updated
      puts "  line #{i + 1}:"
      puts "    before: #{orig.rstrip}"
      puts "    after:  #{updated.rstrip}"
    end
    puts
  else
    File.write(file, content)
    puts "updated: #{File.basename(file)}"
  end
end

action = dry_run ? 'Would update' : 'Updated'
puts "\n#{action} #{changed} files."
