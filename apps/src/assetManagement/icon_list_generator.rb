require 'yaml'
require 'json'

# Convert icons.yml into a JSON file that can be used for fast lookup by keyword.

EXCLUDED_KEYWORDS = {
  alcohol: true,
  liquor: true,
  martini: true,
  # Duplicates
  :'add-on' => true,
  :'bar-chart-o' => true,
  :'battery-0' => true,
  :'battery-1' => true,
  :'battery-2' => true,
  :'battery-3' => true,
  :'battery-4' => true,
  :'battery-5' => true,
  :'e-mail' => true,
  :'facebook-f' => true,
  :'hourglass-1' => true,
  :'hourglass-2' => true,
  :'hourglass-3' => true,
  :'sign up' => true,
  :'star-half-full' => true,
  :'star-half-empty' => true
}

EXCLUDED_ICONS = {
  beer: true,
  bomb: true,
  glass: true,
  :'fighter-jet' => true,
}

data = YAML.load_file 'icons.yml'
icons = data['icons']
@aliases = {}
@unicode = {}

def add_keyword_entry(keyword, icon_id)
  return if EXCLUDED_KEYWORDS[keyword.to_sym] || EXCLUDED_ICONS[icon_id.to_sym]

  keyword.split(/-|\s/).each do |token|
    k = @aliases
    token.split('').each do |letter|
      k = k[letter] ||= {}
    end
    k['$'] ||= []
    k['$'] << icon_id
  end
end

icons.each do |icon|
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
