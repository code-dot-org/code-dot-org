require 'yaml'
require 'json'

# Convert icons.yml into a JSON file that can be used for fast lookup by keyword.

EXCLUDED_KEYWORDS = {
  alcohol: true,
  bar: true,
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
  bomb: true
}

data = YAML.load_file 'icons.yml'
icons = data['icons']
@keywords = {}

def add_keyword_entry(keyword, icon)
  return if EXCLUDED_KEYWORDS[keyword.to_sym] || EXCLUDED_ICONS[icon['id'].to_sym]

  keyword.split(/-|\s/).each do |token|
    k = @keywords
    token.split('').each do |letter|
      k = k[letter] ||= {}
    end
    k['$'] ||= {}
    k['$'][icon['id']] = icon['unicode']
  end
end

icons.each do |icon|
  add_keyword_entry icon['id'], icon
  if icon['filter']
    icon['filter'].each{ |keyword| add_keyword_entry keyword, icon }
  end
  if icon['aliases']
    icon['aliases'].each{ |keyword| add_keyword_entry keyword, icon }
  end
end

File.open('icons.json', 'w') do |file|
  file.write(@keywords.to_json)
end
