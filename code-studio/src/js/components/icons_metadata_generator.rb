#!/usr/bin/env ruby
# Download icons.yml and export icons.js (used for lookup by keyword).

require 'psych'
require 'json'

METADATA_URL = 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/adcbe8eddad1b3423c38489708f7ff2707afa94c/src/icons.yml'

PREAMBLE = <<-JS
/**
 * This is an auto-generated file. Do not edit. Run `./icons_metadata_generator.rb` to regenerate.
 *
 * List of Font Awesome icons to include in the IconLibrary, with keywords.
 * Exported from https://github.com/FortAwesome/Font-Awesome/blob/master/src/icons.yml
 * Licensed CC BY 3.0
 *
 * (Font Awesome by Dave Gandy - http://fontawesome.io/)
 */
JS

EXCLUDED_KEYWORDS = {
  alcohol: true,
  liquor: true,
  martini: true
}

EXCLUDED_ICONS = {
  beer: true,
  bomb: true,
  crosshairs: true,
  glass: true,
  :'fighter-jet' => true
}

EXCLUDED_CATEGORIES = ['Gender Icons']

puts 'Downloading icon metadata file...'

data = Psych.safe_load `curl #{METADATA_URL}`
icons = data['icons']
@aliases = {}
@unicode = {}

def add_keyword_entry(keyword, icon_id)
  return if EXCLUDED_KEYWORDS[keyword.to_sym]

  @aliases[keyword.to_sym] ||= []
  @aliases[keyword.to_sym] << icon_id
end

icons.each do |icon|
  next if EXCLUDED_ICONS[icon['id'].to_sym] || !(EXCLUDED_CATEGORIES & icon['categories']).empty?

  id = icon['id']
  add_keyword_entry id, id
  if icon['filter']
    icon['filter'].each{ |keyword| add_keyword_entry keyword, id }
  end
  if icon['aliases']
    icon['aliases'].each{ |keyword| add_keyword_entry keyword, id }
  end

  @unicode[id] = icon['unicode']
end

File.open('icons.js', 'w') do |file|
  output = {aliases: @aliases, unicode: @unicode}

  file.write PREAMBLE
  file.write "module.exports = #{output.to_json};\n"
end
