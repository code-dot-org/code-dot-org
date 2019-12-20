#!/usr/bin/env ruby
require_relative('../config/environment')
require 'cdo/properties'

TEXT_FIELDS = %w(title content1 content2 content3)
ARRAY_FIELDS = %w(questions answers)

# requires https://github.com/xijo/reverse_markdown
ReverseMarkdown.config do |config|
  config.tag_border = ''
end

def has_html?(text)
  text.strip_html_tags != text
end

total = DSLDefined.all.count
DSLDefined.all.each_with_index do |level, i|
  puts "#{i}/#{total}" if i > 0 && i % (total / 5) == 0
  next unless level.script_levels.count > 0

  new_text = false

  values = []

  TEXT_FIELDS.each do |field|
    next unless level.properties.key?(field)
    values << level.properties[field]
  end

  ARRAY_FIELDS.each do |array_field|
    next unless level.properties.key?(array_field)
    level.properties[array_field].each do |field|
      values << field["text"]
    end
  end

  values.compact.each do |value|
    next unless has_html? value
    new = ReverseMarkdown.convert(value).rstrip
    next if value == new
    new_text = level.dsl_text if new_text == false
    next unless new_text.is_a? String
    new_text.sub!(value, new)
  end

  level.rewrite_dsl_file(new_text) if new_text
end
