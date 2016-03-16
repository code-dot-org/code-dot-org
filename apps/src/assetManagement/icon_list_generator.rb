require 'yaml'
require 'json'

# Convert icons.yml into a JSON file that can be used for fast lookup by keyword.

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

data = YAML.load_file 'icons.yml'
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

File.open('icons.json', 'w') do |file|
  file.write({aliases: @aliases, unicode: @unicode}.to_json)
end
