#!/usr/bin/env ruby
require 'json'

# The first argument should be a string which will match the keys of the etags you want to remove.
files_to_remove = ARGV.first
etags_file_path = './bin/i18n/crowdin/codeorg_etags.json'
etags_file = File.read(etags_file_path)
etags_json = JSON.parse(etags_file)
etags_json.each do |locale, records|
  etags_json[locale] = records.select {|file, _| !file.include?(files_to_remove)}
end
puts "Removed '#{files_to_remove}' etags from #{etags_file_path}"
File.write(etags_file_path, JSON.pretty_generate(etags_json))
