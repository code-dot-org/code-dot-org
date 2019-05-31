#!/usr/bin/env ruby

# Distribute downloaded translations from i18n/locales
# back to blockly-core, apps, pegasus, and dashboard.

require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/languages'

require 'fileutils'
require 'json'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'

CLEAR = "\r\033[K"

def sync_out
  rename_from_crowdin_name_to_locale
  restore_redacted_files
  distribute_translations
  copy_untranslated_apps
  rebuild_blockly_js_files
  puts "updating TTS I18n (should usually take 2-3 minutes, may take up to 15 if there are a whole lot of translation updates)"
  run_standalone_script "dashboard/scripts/update_tts_i18n.rb"
end

# Files downloaded from Crowdin are organized by language name,
# rename folders to be organized by locale
def rename_from_crowdin_name_to_locale
  Languages.get_crowdin_name_and_locale.each do |prop|
    if File.directory?("i18n/locales/#{prop[:crowdin_name_s]}/")
      FileUtils.cp_r "i18n/locales/#{prop[:crowdin_name_s]}/.", "i18n/locales/#{prop[:locale_s]}"
      FileUtils.rm_r "i18n/locales/#{prop[:crowdin_name_s]}"
    end
  end
end

def restore_redacted_files
  total_locales = Languages.get_locale.count
  Languages.get_locale.each_with_index do |prop, i|
    locale = prop[:locale_s]
    print "#{CLEAR}Restoring #{locale} (#{i}/#{total_locales})"
    $stdout.flush
    next if locale == 'en-US'
    next unless File.directory?("i18n/locales/#{locale}/")

    Dir.glob("i18n/locales/original/**/*.*").each do |original_path|
      translated_path = original_path.sub("original", locale)

      plugin = nil
      if original_path == 'i18n/locales/original/dashboard/blocks.yml'
        plugin = 'blockfield'
      end
      restore(original_path, translated_path, translated_path, plugin)
    end
  end
end

# Recursively run through the data received from crowdin, sanitizing it for
# consumption by our system.
#
# Sanitization rules applied:
#   - restore carraige returns (crowdin escapes them)
#   - eliminate empty strings from hashes (empty strings are how crowdin
#     returns untranslated strings for certain serialization formats)
def sanitize!(data)
  if data.is_a? Hash
    data.values.each {|datum| sanitize!(datum)}
    data.delete_if {|_key, value| value.nil? || value.try(:empty?)}
  elsif data.is_a? Array
    data.each {|datum| sanitize!(datum)}
  elsif data.is_a? String
    data.gsub!(/\\r/, "\r")
  elsif [true, false].include? data
    # pass
  elsif data.nil?
    # pass
  else
    raise "can't process unknown type: #{data}"
  end
end

def sanitize_file_and_write(loc_path, dest_path)
  loc_data = case File.extname(loc_path)
             when '.yaml', '.yml'
               YAML.load_file(loc_path)
             when '.json'
               JSON.parse(File.read(loc_path))
             else
               raise "do not know how to parse localization file from #{loc_path}"
             end
  sanitize_data_and_write(loc_data, dest_path)
end

def sanitize_data_and_write(data, dest_path)
  sanitize! data

  dest_data = case File.extname(dest_path)
              when '.yaml', '.yml'
                data.to_yaml
              when '.json'
                JSON.pretty_generate(data)
              else
                raise "do not know how to serialize localization data to #{dest_path}"
              end

  FileUtils.mkdir_p(File.dirname(dest_path))
  File.open(dest_path, 'w+') do |f|
    f.write(dest_data)
  end
end

def distribute_course_content(locale)
  translated_strings = {
    "display_name" => {},
    "short_instructions" => {},
    "long_instructions" => {},
    "failure_message_overrides" => {},
    "authored_hints" => {},
    "callouts" => {},
    "block_categories" => {},
    "function_names" => {}
  }

  Dir.glob("i18n/locales/#{locale}/course_content/**/*.json") do |loc_file|
    file = File.open loc_file
    translated_data = JSON.load(file)
    file.close
    first_key = translated_data.keys.first
    translated_data = translated_data[first_key]
    next unless translated_data
    translated_data['data'].each do |type, type_data|
      type_data.each do |level_url, level_data|
        level = get_level_from_url(level_url)
        translated_strings[type][level.name] = level_data
      end
    end
  end

  translated_strings.each do |type, translations|
    type_data = {}
    type_data[locale] = Hash.new
    type_data[locale]["data"] = Hash.new
    type_data[locale]["data"][type] = Hash.new
    type_data[locale]["data"][type] = translations
    sanitize_data_and_write(type_data, "dashboard/config/locales/#{type}.#{locale}.yml")
  end
end

# Distribute downloaded translations from i18n/locales
# back to blockly, apps, pegasus, and dashboard.
def distribute_translations
  total_locales = Languages.get_locale.count
  Languages.get_locale.each_with_index do |prop, i|
    locale = prop[:locale_s]
    print "#{CLEAR}Distributing #{locale} (#{i}/#{total_locales})"
    $stdout.flush
    next if locale == 'en-US'
    next unless File.directory?("i18n/locales/#{locale}/")

    ### Dashboard
    Dir.glob("i18n/locales/#{locale}/dashboard/*.yml") do |loc_file|
      relname = File.basename(loc_file, '.yml')

      # Special case the un-prefixed Yaml file.
      destination = (relname == "base") ?
        "dashboard/config/locales/#{locale}.yml" :
        "dashboard/config/locales/#{relname}.#{locale}.yml"

      sanitize_file_and_write(loc_file, destination)
    end

    distribute_course_content(locale)

    ### Apps
    js_locale = locale.tr('-', '_').downcase
    Dir.glob("i18n/locales/#{locale}/blockly-mooc/*.json") do |loc_file|
      relname = File.basename(loc_file, '.json')
      destination = "apps/i18n/#{relname}/#{js_locale}.json"
      sanitize_file_and_write(loc_file, destination)
    end

    ### Blockly Core
    Dir.glob("i18n/locales/#{locale}/blockly-core/*.json") do |loc_file|
      relname = File.basename(loc_file)
      destination = "apps/node_modules/@code-dot-org/blockly/i18n/locales/#{locale}/#{relname}"
      sanitize_file_and_write(loc_file, destination)
    end

    ### Pegasus
    loc_file = "i18n/locales/#{locale}/pegasus/mobile.yml"
    destination = "pegasus/cache/i18n/#{locale}.yml"
    sanitize_file_and_write(loc_file, destination)
  end

  puts "#{CLEAR}Distribution finished!"
end

# For untranslated apps, copy English file for all locales
def copy_untranslated_apps
  untranslated_apps = %w(applab calc eval gamelab netsim weblab)

  Languages.get_locale.each do |prop|
    next unless prop[:locale_s] != 'en-US'
    untranslated_apps.each do |app|
      app_locale = prop[:locale_s].tr('-', '_').downcase!
      FileUtils.cp_r "apps/i18n/#{app}/en_us.json", "apps/i18n/#{app}/#{app_locale}.json"
    end
  end
end

def rebuild_blockly_js_files
  run_bash_script "apps/node_modules/@code-dot-org/blockly/i18n/codeorg-messages.sh"
  Dir.chdir('apps') do
    puts `yarn build`
  end
end

# retrieves an ordered array of strings representing all image or link
# values in the passed value; can support strings, arrays, or
# (recursively) hashes. For hashes, results will be lexicographically
# ordered by key.
def get_links_and_images(value)
  # regex to detect links and images in both markup and markdown formats
  link_or_image_re = /(?:\]\(\S*\)|(?:src|href)=["']\S*["'])/

  if value.nil?
    return []
  elsif value.instance_of? String
    return value.scan(link_or_image_re)
  elsif value.instance_of? Array
    return value.join(' ').scan(link_or_image_re)
  elsif value.instance_of? Hash
    values = value.keys.sort.map do |key|
      get_links_and_images(value[key])
    end
    return values.flatten
  end
end

sync_out if __FILE__ == $0
