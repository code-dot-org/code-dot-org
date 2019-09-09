#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'fileutils'
require 'json'

require_relative 'i18n_script_utils'
require_relative 'redact_restore_utils'

I18N_SOURCE_DIR = "i18n/locales/source"

def sync_in
  localize_level_content
  localize_block_content
  puts "Copying source files"
  I18nScriptUtils.run_bash_script "bin/i18n-codeorg/in.sh"
  redact_level_content
  redact_block_content
end

def get_i18n_strings(level)
  i18n_strings = {}

  if level.is_a?(DSLDefined)
    text = level.dsl_text
    i18n_strings["dsls"] = level.class.dsl_class.parse(text, '')[1] if text
  elsif level.is_a?(Level)
    %w(
      display_name
      short_instructions
      long_instructions
      failure_message_overrides
    ).each do |prop|
      i18n_strings[prop] = level.try(prop)
    end

    # authored_hints
    if level.authored_hints
      authored_hints = JSON.parse(level.authored_hints)
      i18n_strings['authored_hints'] = Hash.new unless authored_hints.empty?
      authored_hints.each do |hint|
        i18n_strings['authored_hints'][hint['hint_id']] = hint['hint_markdown']
      end
    end

    # callouts
    if level.callout_json
      callouts = JSON.parse(level.callout_json)
      i18n_strings['callouts'] = Hash.new unless callouts.empty?
      callouts.each do |callout|
        i18n_strings['callouts'][callout['localization_key']] = callout['callout_text']
      end
    end

    level_xml = Nokogiri::XML(level.to_xml, &:noblanks)
    blocks = level_xml.xpath('//blocks').first
    if blocks
      ## Categories
      block_categories = blocks.xpath('//category')
      i18n_strings['block_categories'] = Hash.new unless block_categories.empty?
      block_categories.each do |category|
        name = category.attr('name')
        i18n_strings['block_categories'][name] = name if name
      end

      ## Function Names
      functions = blocks.xpath("//block[@type=\"procedures_defnoreturn\"]")
      i18n_strings['function_names'] = Hash.new unless functions.empty?
      functions.each do |function|
        name = function.at_xpath('./title[@name="NAME"]')
        i18n_strings['function_names'][name.content] = name.content if name
      end
    end
  end

  i18n_strings["contained levels"] = level.contained_levels.map do |contained_level|
    get_i18n_strings(contained_level)
  end

  i18n_strings.delete_if {|_, value| value.blank?}
end

def localize_level_content
  puts "Localizing level content"

  block_category_strings = {}

  # We have to run this specifically from the Rails directory because
  # get_i18n_strings relies on level.dsl_text which relies on level.filename
  # which relies on running a shell command
  Dir.chdir(Rails.root) do
    Script.all.each do |script|
      next unless ScriptConstants.i18n? script.name
      script_strings = {}
      script.script_levels.each do |script_level|
        level = script_level.oldest_active_level
        url = I18nScriptUtils.get_level_url_key(script, level)
        script_strings[url] = get_i18n_strings(level)

        # extract block category strings; although these are defined for each
        # level, the expectation here is that there is a massive amount of
        # overlap between levels, so we actually want to just present these all
        # as a single group rather than breaking them up by script
        if script_strings[url].key? "block_categories"
          block_category_strings.merge! script_strings[url].delete("block_categories")
        end
      end
      script_strings.delete_if {|_, value| value.blank?}

      script_i18n_directory = "../#{I18N_SOURCE_DIR}/course_content"
      script_i18n_directory =
        if script.version_year
          File.join(script_i18n_directory, script.version_year)
        elsif ScriptConstants.script_in_category?(:hoc, script.name)
          File.join(script_i18n_directory, "Hour of Code")
        else
          File.join(script_i18n_directory, "other")
        end
      FileUtils.mkdir_p script_i18n_directory
      script_i18n_filename = File.join(script_i18n_directory, "#{script.name}.json")
      File.open(script_i18n_filename, 'w') do |file|
        file.write(JSON.pretty_generate(script_strings))
      end
    end
  end

  File.open(File.join(I18N_SOURCE_DIR, "dashboard/block_categories.json"), 'w') do |file|
    file.write(JSON.pretty_generate(block_category_strings.sort.to_h))
  end
end

# Pull in various fields for custom blocks from .json files and save them to
# blocks.en.yml.
def localize_block_content
  puts "Localizing block content"

  blocks = {}

  Dir.glob('dashboard/config/blocks/**/*.json').sort.each do |file|
    name = File.basename(file, '.*')
    config = JSON.parse(File.read(file))['config']
    blocks[name] = {
      'text' => config['blockText'],
    }

    next unless config['args']

    args_with_options = {}
    config['args'].each do |arg|
      next if !arg['options'] || arg['options'].empty?

      options = args_with_options[arg['name']] = {}
      arg['options'].each do |option_tuple|
        options[option_tuple.last] = option_tuple.first
      end
    end
    blocks[name]['options'] = args_with_options unless args_with_options.empty?
  end

  File.open("dashboard/config/locales/blocks.en.yml", "w+") do |f|
    f.write(I18nScriptUtils.to_crowdin_yaml({"en" => {"data" => {"blocks" => blocks}}}))
  end
end

def select_redactable(i18n_strings)
  redactable_content = %w(
    authored_hints
    long_instructions
    short_instructions
  )

  redactable = i18n_strings.select do |key, _|
    redactable_content.include? key
  end

  if i18n_strings.key? "contained levels"
    contained_levels = i18n_strings["contained levels"].map do |contained_level|
      select_redactable(contained_level)
    end
    contained_levels.select! do |result|
      !result.blank?
    end
    redactable["contained levels"] = contained_levels unless contained_levels.empty?
  end

  redactable.delete_if {|_k, v| v.blank?}
end

def redact_level_file(source_path)
  return unless File.exist? source_path
  source_data = JSON.load(File.open(source_path))
  return if source_data.blank?

  redactable_data = source_data.map do |level_url, i18n_strings|
    [level_url, select_redactable(i18n_strings)]
  end.to_h

  backup_path = source_path.sub("source", "original")
  FileUtils.mkdir_p File.dirname(backup_path)
  File.open(backup_path, "w") do |file|
    file.write(JSON.pretty_generate(redactable_data))
  end

  redacted_data = RedactRestoreUtils.redact_data(redactable_data, ['blockly'])

  File.open(source_path, 'w') do |source_file|
    source_file.write(JSON.pretty_generate(source_data.deep_merge(redacted_data)))
  end
end

def redact_level_content
  puts "Redacting level content"

  Dir.glob(File.join(I18N_SOURCE_DIR, "course_content/**/*.json")).each do |source_path|
    redact_level_file(source_path)
  end
end

def redact_block_content
  puts "Redacting block content"

  source = File.join(I18N_SOURCE_DIR, "dashboard/blocks.yml")
  backup = source.sub("source", "original")
  FileUtils.mkdir_p(File.dirname(backup))
  FileUtils.cp(source, backup)
  RedactRestoreUtils.redact(source, source, ['blockfield'], 'txt')
end

sync_in if __FILE__ == $0
