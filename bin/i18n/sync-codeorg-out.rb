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
  check_for_mismatching_links_or_images
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

    Dir.glob("i18n/locales/redacted/**/*.*").each do |redacted_path|
      source_path = redacted_path.sub("redacted", "source")
      translated_path = redacted_path.sub("redacted", locale)

      plugin = nil
      if redacted_path == 'i18n/locales/redacted/dashboard/blocks.yml'
        plugin = 'blockfield'
      end
      restore(source_path, translated_path, translated_path, plugin)
    end
  end
end

# Recursively run through the data received from crowdin, sanitizing it for
# consumption by our system.
# Currently just restores carraige returns (since crowdin escapes them), but
# could be expanded to do more.
def sanitize!(data)
  if data.is_a? Hash
    data.values.each {|datum| sanitize!(datum)}
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

def sanitize_and_write(loc_path, dest_path)
  loc_data = case File.extname(loc_path)
             when '.yaml', '.yml'
               YAML.load_file(loc_path)
             when '.json'
               JSON.parse(File.read(loc_path))
             else
               raise "do not know how to parse localization file from #{loc_path}"
             end

  sanitize! loc_data

  dest_data = case File.extname(dest_path)
              when '.yaml', '.yml'
                loc_data.to_yaml
              when '.json'
                JSON.pretty_generate(loc_data)
              else
                raise "do not know how to serialize localization data to #{dest_path}"
              end

  FileUtils.mkdir_p(File.dirname(dest_path))
  File.open(dest_path, 'w+') do |f|
    f.write(dest_data)
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

      sanitize_and_write(loc_file, destination)
    end

    ### Apps
    js_locale = locale.tr('-', '_').downcase
    Dir.glob("i18n/locales/#{locale}/blockly-mooc/*.json") do |loc_file|
      relname = File.basename(loc_file, '.json')
      destination = "apps/i18n/#{relname}/#{js_locale}.json"
      sanitize_and_write(loc_file, destination)
    end

    ### Blockly Core
    Dir.glob("i18n/locales/#{locale}/blockly-core/*.json") do |loc_file|
      relname = File.basename(loc_file)
      destination = "apps/node_modules/@code-dot-org/blockly/i18n/locales/#{locale}/#{relname}"
      sanitize_and_write(loc_file, destination)
    end

    ### Pegasus
    loc_file = "i18n/locales/#{locale}/pegasus/mobile.yml"
    destination = "pegasus/cache/i18n/#{locale}.yml"
    sanitize_and_write(loc_file, destination)
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

def check_for_mismatching_links_or_images
  categories_to_check = %w(
    instructions
    markdown_instructions
    failure_message_overrides
    authored_hints
    callouts
  )

  outputfile = Tempfile.new('sync-codeorg-out')

  Languages.get_locale.each do |prop|
    locale = prop[:locale_s]

    # don't check english, as it is our base language
    next if locale == 'en-US'

    # also don't check Italian; they have a lot of custom translation
    # work which we whitelist
    next if locale == 'it-IT'

    print "validating #{locale} ..."

    mismatch_found = false

    categories_to_check.each do |category|
      locale_file = "dashboard/config/locales/#{category}.#{locale}.yml"
      source_file = "dashboard/config/locales/#{category}.en.yml"

      # this absurd little dance is necessary because of the format of
      # each of these yaml files; they each have a hash with a single
      # key representing the two-character version of the locale whose
      # value is a hash with the single key 'data' whose value is a hash
      # with a single key representing the category name whose value is
      # (finally) the data we actually want.
      source_data = YAML.load(File.open(source_file)).values.first.values.first.values.first
      locale_data = YAML.load(File.open(locale_file)).values.first.values.first.values.first

      if source_data.keys != locale_data.keys
        outputfile.write "mismatching keys in #{locale_file}"
        mismatch_found = true
      end

      mismatching_keys = locale_data.keys.select do |key|
        get_links_and_images(source_data[key]) != get_links_and_images(locale_data[key])
      end

      next if mismatching_keys.empty?
      mismatch_found = true
      outputfile.write("mismatching values in #{locale_file}\n")
      outputfile.write("and therefore also in i18n/locales/#{locale}/dashboard/#{category}.yml:\n")
      mismatching_keys.each do |key|
        outputfile.write("\t#{key}\n")
        outputfile.write("\t\ten:\n")
        get_links_and_images(source_data[key]).each do |x|
          outputfile.write("\t\t\t#{x}\n")
        end
        outputfile.write("\t\t#{locale}:\n")
        get_links_and_images(locale_data[key]).each do |x|
          outputfile.write("\t\t\t#{x}\n")
        end
      end
      outputfile.write("\n")
    end

    if mismatch_found
      # if we find at least one mismatch, remove the finalizer from the
      # tempfile that would otherwise delete it when this script exits
      ObjectSpace.undefine_finalizer(outputfile)
      puts " MISMATCH FOUND! output in #{outputfile.path}"
    else
      puts " all good"
    end
  end

  outputfile.close
end

sync_out if __FILE__ == $0
