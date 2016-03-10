require 'yaml'
require 'json'

# Convert icons.yml into a JSON file that can be used for fast lookup by keyword.

data = YAML.load_file 'icons.yml'
icons = data['icons']
@keywords = {}

def add_keyword_entry(keyword, icon)
  keyword.split('-').each do |token|
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
    icon['filter'].each do |keyword|
      add_keyword_entry keyword, icon
    end
  end
end

File.open('icons.json', 'w') do |file|
  file.write(@keywords.to_json)
end
