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
require_relative 'redact_restore_utils'

CLEAR = "\r\033[K"

def sync_out
  rename_from_crowdin_name_to_locale
  restore_redacted_files
  distribute_translations
  copy_untranslated_apps
  rebuild_blockly_js_files
  puts "updating TTS I18n (should usually take 2-3 minutes, may take up to 15 if there are a whole lot of translation updates)"
  I18nScriptUtils.run_standalone_script "dashboard/scripts/update_tts_i18n.rb"
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

def find_malformed_links_images(locale, file_path)
  return unless File.exist?(file_path)
  is_json = File.extname(file_path) == '.json'
  data =
    if is_json
      file = File.open(file_path, 'r')
      JSON.load(file)
    else
      YAML.load_file(file_path)
    end

  return unless data
  return unless data&.values&.first&.length
  I18nScriptUtils.recursively_find_malformed_links_images(data, locale, file_path)
end

def restore_redacted_files
  total_locales = Languages.get_locale.count
  original_files = Dir.glob("i18n/locales/original/**/*.*").to_a
  Languages.get_locale.each_with_index do |prop, locale_index|
    locale = prop[:locale_s]
    next if locale == 'en-US'
    next unless File.directory?("i18n/locales/#{locale}/")

    original_files.each_with_index do |original_path, file_index|
      translated_path = original_path.sub("original", locale)
      next unless File.file?(translated_path)

      print "#{CLEAR}Restoring #{locale} (#{locale_index}/#{total_locales}) file #{file_index}/#{original_files.count}"
      $stdout.flush

      if original_path.include? "course_content"
        restored_data = RedactRestoreUtils.restore_file(original_path, translated_path, ['blockly'])
        translated_data = JSON.parse(File.read(translated_path))
        File.open(translated_path, "w") do |file|
          file.write(JSON.pretty_generate(translated_data.deep_merge(restored_data)))
        end
      elsif original_path == 'i18n/locales/original/dashboard/blocks.yml'
        RedactRestoreUtils.restore(original_path, translated_path, translated_path, ['blockfield'], 'txt')
      else
        RedactRestoreUtils.restore(original_path, translated_path, translated_path)
      end
      find_malformed_links_images(locale, translated_path)
    end
    I18nScriptUtils.upload_malformed_restorations(locale)
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
  loc_data =
    case File.extname(loc_path)
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

  dest_data =
    case File.extname(dest_path)
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

def serialize_i18n_strings(level, strings)
  result = Hash.new

  if strings.key? "contained levels"
    contained_strings = strings.delete("contained levels")
    unless contained_strings.blank?
      level.contained_levels.zip(contained_strings).each do |contained_level, contained_string|
        result.deep_merge! serialize_i18n_strings(contained_level, contained_string)
      end
    end
  end

  strings.each do |string_type, translated_string|
    result[string_type] ||= Hash.new
    result[string_type][level.name] = translated_string
  end

  result
end

def distribute_course_content(locale)
  locale_strings = {}

  Dir.glob("i18n/locales/#{locale}/course_content/**/*.json") do |course_strings_file|
    course_strings = JSON.load(File.read(course_strings_file))
    next unless course_strings

    course_strings.each do |level_url, level_strings|
      level = I18nScriptUtils.get_level_from_url(level_url)
      locale_strings.deep_merge! serialize_i18n_strings(level, level_strings)
    end
  end

  locale_strings.each do |type, translations|
    type_data = Hash.new
    type_data[locale] = Hash.new
    type_data[locale]["data"] = Hash.new
    type_data[locale]["data"][type] = translations.sort.to_h
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
  I18nScriptUtils.run_bash_script "apps/node_modules/@code-dot-org/blockly/i18n/codeorg-messages.sh"
  Dir.chdir('apps') do
    puts `yarn build`
  end
end

sync_out if __FILE__ == $0
