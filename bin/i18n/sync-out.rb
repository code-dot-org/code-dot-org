#!/usr/bin/env ruby

# Distribute downloaded translations from i18n/locales
# back to blockly-core, apps, pegasus, and dashboard.

require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/languages'

require 'cdo/crowdin/utils'
require 'cdo/crowdin/project'

require 'fileutils'
require 'json'
require 'parallel'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'
require_relative 'redact_restore_utils'
require_relative 'hoc_sync_utils'
require_relative '../../tools/scripts/ManifestBuilder'

def sync_out(upload_manifests=false)
  rename_from_crowdin_name_to_locale
  restore_redacted_files
  distribute_translations(upload_manifests)
  copy_untranslated_apps
  rebuild_blockly_js_files
  restore_markdown_headers
  HocSyncUtils.sync_out
  puts "updating TTS I18n (should usually take 2-3 minutes, may take up to 15 if there are a whole lot of translation updates)"
  I18nScriptUtils.with_synchronous_stdout do
    I18nScriptUtils.run_standalone_script "dashboard/scripts/update_tts_i18n.rb"
  end
end

# Return true iff the specified file in the specified locale had changes
# as of the most recent sync down.
#
# @param locale [String] the locale code to check. This can be either the
#  four-letter code used internally (ie, "es-ES", "es-MX", "it-IT", etc), OR
#  the two-letter code used by crowdin, for those languages for which we have
#  only a single variation ("it", "de", etc).
#
# @param file [String] the path to the file to check. Note that this should be
#  the relative path of the file as it exists within the locale directory; ie
#  "/dashboard/base.yml", "/blockly-mooc/maze.json",
#  "/course_content/2018/coursea-2018.json", etc.
def file_changed?(locale, file)
  @change_datas ||= CROWDIN_PROJECTS.keys.map do |crowdin_project|
    project = Crowdin::Project.new(crowdin_project, nil)
    utils = Crowdin::Utils.new(project)
    unless File.exist?(utils.changes_json)
      raise <<~ERR
        No "changes" json found at #{utils.changes_json}.

        We expect to find a file containing a list of files changed by the most
        recent sync down; if this file does not exist, it likely means that no
        sync down has been run on this machine, so there is nothing to sync out
      ERR
    end
    JSON.load(File.read(utils.changes_json))
  end

  crowdin_code = Languages.get_code_by_locale(locale)
  return @change_datas.any? do |change_data|
    change_data.dig(locale, file) || change_data.dig(crowdin_code, file)
  end
end

# Files downloaded from Crowdin are organized by language name; rename folders
# to be organized by locale, and remove any locales that are not in our system.
def rename_from_crowdin_name_to_locale
  # Move directories like `i18n/locales/Italian` to `i18n/locales/it-it` for
  # all languages in our system
  Languages.get_crowdin_name_and_locale.each do |prop|
    next unless File.directory?("i18n/locales/#{prop[:crowdin_name_s]}/")

    # copy and remove rather than moving so we can easily and recursively deal
    # with existing files
    FileUtils.cp_r "i18n/locales/#{prop[:crowdin_name_s]}/.", "i18n/locales/#{prop[:locale_s]}"
    FileUtils.rm_r "i18n/locales/#{prop[:crowdin_name_s]}"
  end

  # Now, any remaining directories named after the language name (rather than
  # the four-letter language code) represent languages downloaded from crowdin
  # that aren't in our system. Remove them.
  FileUtils.rm_r Dir.glob("i18n/locales/[A-Z]*")
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
  locales = Languages.get_locale
  original_dir = "i18n/locales/original"
  original_files = Dir.glob("#{original_dir}/**/*.*").to_a
  if original_files.empty?
    raise <<~ERR
      No original files found from which to restore.

      Originals are created by running the sync-in, but are not persisted in
      git; this likely happened because a sync-out was attempted without a
      corresponding sync-in.
    ERR
  end

  puts "Restoring redacted files in #{locales.count} locales, parallelized between #{Parallel.processor_count} processes"

  Parallel.each(locales) do |prop|
    locale = prop[:locale_s]
    next if locale == 'en-US'
    next unless File.directory?("i18n/locales/#{locale}/")

    original_files.each do |original_path|
      relative_path = original_path.delete_prefix(original_dir)
      next unless file_changed?(locale, relative_path)

      translated_path = original_path.sub("original", locale)
      next unless File.file?(translated_path)

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
  puts "Restoration finished!"
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
  locale_dir = File.join("i18n/locales", locale)

  Dir.glob(File.join(locale_dir, "course_content/**/*.json")) do |course_strings_file|
    course_strings = JSON.load(File.read(course_strings_file))
    next unless course_strings

    course_strings.each do |level_url, level_strings|
      level = I18nScriptUtils.get_level_from_url(level_url)
      next unless level.present?
      locale_strings.deep_merge! serialize_i18n_strings(level, level_strings)
    end
  end

  locale_strings.each do |type, translations|
    type_data = Hash.new
    type_data[locale] = Hash.new
    type_data[locale]["data"] = Hash.new
    type_data[locale]["data"][type] = translations.sort.to_h

    # We'd like in the long term for all of our generated course content locale
    # files to be in JSON rather than YAML. As a first step on that journey,
    # here we serialize all of the locale types except DSLs to JSON. The DSL
    # locale file is unfortunately touched by a few other processes, so
    # converting that one over will have to be done as part of a larger effort.
    extension = type == "dsls" ? "yml" : "json"
    sanitize_data_and_write(type_data, "dashboard/config/locales/#{type}.#{locale}.#{extension}")
  end
end

# Distribute downloaded translations from i18n/locales
# back to blockly, apps, pegasus, and dashboard.
def distribute_translations(upload_manifests)
  locales = Languages.get_locale
  puts "Distributing translations in #{locales.count} locales, parallelized between #{Parallel.processor_count} processes"

  Parallel.each(locales) do |prop|
    locale = prop[:locale_s]
    locale_dir = File.join("i18n/locales", locale)
    next if locale == 'en-US'
    next unless File.directory?(locale_dir)

    ### Dashboard
    Dir.glob("i18n/locales/#{locale}/dashboard/*.{json,yml}") do |loc_file|
      ext = File.extname(loc_file)
      relative_path = loc_file.delete_prefix(locale_dir)
      next unless file_changed?(locale, relative_path)

      basename = File.basename(loc_file, ext)

      # Special case the un-prefixed Yaml file.
      destination = (basename == "base") ?
        "dashboard/config/locales/#{locale}#{ext}" :
        "dashboard/config/locales/#{basename}.#{locale}#{ext}"

      sanitize_file_and_write(loc_file, destination)
    end

    ### Course Content
    distribute_course_content(locale)

    ### Apps
    js_locale = locale.tr('-', '_').downcase
    Dir.glob("#{locale_dir}/blockly-mooc/*.json") do |loc_file|
      relative_path = loc_file.delete_prefix(locale_dir)
      next unless file_changed?(locale, relative_path)

      basename = File.basename(loc_file, '.json')
      destination = "apps/i18n/#{basename}/#{js_locale}.json"
      sanitize_file_and_write(loc_file, destination)
    end

    ### Animation library
    spritelab_animation_translation_path = "/animations/spritelab_animation_library.json"
    if file_changed?(locale, spritelab_animation_translation_path)
      @manifest_builder ||= ManifestBuilder.new({spritelab: true, upload_to_s3: true})
      spritelab_animation_translation_file = File.join(locale_dir, spritelab_animation_translation_path)
      translations = JSON.load(File.open(spritelab_animation_translation_file))
      # Use js_locale here as the animation library is used by apps
      @manifest_builder.upload_localized_manifest(js_locale, translations) if upload_manifests
    end

    ### Blockly Core
    # Blockly doesn't know how to fall back to English, so here we manually and
    # explicitly default all untranslated strings to English.
    blockly_english = JSON.load(File.open("i18n/locales/source/blockly-core/core.json"))
    Dir.glob("#{locale_dir}/blockly-core/*.json") do |loc_file|
      relative_path = loc_file.delete_prefix(locale_dir)
      next unless file_changed?(locale, relative_path)

      translations = JSON.load(File.open(loc_file))
      # Create a hash containing all translations, with English strings in
      # place of any missing translations. We do this as 'english merge
      # translations' rather than 'translations merge english' to ensure that
      # we include all the keys from English, regardless of which keys are in
      # the translations hash.
      translations_with_fallback = blockly_english.merge(translations) do |_key, english, translation|
        translation.empty? ? english : translation
      end
      relname = File.basename(loc_file)
      destination = "apps/node_modules/@code-dot-org/blockly/#{locale_dir}/#{relname}"
      sanitize_data_and_write(translations_with_fallback, destination)
    end

    ### Pegasus markdown
    Dir.glob("#{locale_dir}/codeorg-markdown/**/*.*") do |loc_file|
      relative_path = loc_file.delete_prefix(locale_dir)
      next unless file_changed?(locale, relative_path)

      destination_dir = "pegasus/sites.v3/code.org/i18n/public"
      relative_dir = File.dirname(loc_file.delete_prefix("#{locale_dir}/codeorg-markdown"))
      name = File.basename(loc_file, ".*")
      destination = File.join(destination_dir, relative_dir, "#{name}.#{locale}.md.partial")
      FileUtils.mv(loc_file, destination)
    end

    ### Pegasus
    loc_file = "#{locale_dir}/pegasus/mobile.yml"
    destination = "pegasus/cache/i18n/#{locale}.yml"
    sanitize_file_and_write(loc_file, destination)
  end

  puts "Distribution finished!"
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
    _stdout, stderr, status = Open3.capture3('yarn build')
    unless status == 0
      puts "Error building apps:"
      puts stderr
    end
  end
end

# In the sync in, we slice the YAML headers of the files we upload to crowdin
# down to just the part we want to translate (ie, the title). Here, we
# reinflate the header with all the values from the source file.
def restore_markdown_headers
  Dir.glob("pegasus/sites.v3/code.org/i18n/public/**/*.md.partial").each do |path|
    # Find the source version of this file
    source_path = path.sub(/\/i18n\/public\//, "/public/").sub(/[a-z]+-[A-Z]+.md.partial/, "md.partial")
    unless File.exist? source_path
      # Because we give _all_ files coming from crowdin the partial
      # extension, we can't know for sure whether or not the source also uses
      # that extension unless we check both with and without.
      source_path = File.join(File.dirname(source_path), File.basename(source_path, ".partial"))
    end
    source_header, _source_content, _source_line = Documents.new.helpers.parse_yaml_header(source_path)
    header, content, _line = Documents.new.helpers.parse_yaml_header(path)
    I18nScriptUtils.sanitize_header!(header)
    restored_header = source_header.merge(header)
    I18nScriptUtils.write_markdown_with_header(content, restored_header, path)
  end
end

sync_out if __FILE__ == $0
