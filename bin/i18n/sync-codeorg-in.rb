#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

require File.expand_path('../../../pegasus/src/env', __FILE__)
require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'fileutils'
require 'json'
require 'yaml'
require 'tempfile'

require_relative 'i18n_script_utils'

def sync_in
  prepare_course_redaction_strings
  serialize_and_redact_course_content
  localize_levels_blocks_content
  localize_block_content
  run_bash_script "bin/i18n-codeorg/in.sh"
  redact_block_content
end

def copy_to_yml(label, data)
  File.open("dashboard/config/locales/#{label}.en.yml", "w+") do |f|
    f.write(to_crowdin_yaml({"en" => {"data" => {label => data}}}))
  end
end

# sanitize a string before uploading to crowdin. Currently only performs
# CRLF -> LF conversion, but could be extended to do more
def sanitize(string)
  return string.gsub(/\r(\n)?/, "\n")
end

def redact_translated_data(path, plugins = nil)
  source = "i18n/locales/source/#{path}"
  backup = "i18n/locales/original/#{path}"
  FileUtils.mkdir_p(File.dirname(backup))
  FileUtils.cp(source, backup)
  redact_file(source, source, plugins)
end

def redact_block_content
  redact_translated_data('dashboard/blocks.yml', 'blockfield')
end

# Pull in various fields for custom blocks from .json files and save them to
# blocks.en.yml.
def localize_block_content
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

  copy_to_yml('blocks', blocks)
end

def sanitize_crowdin_filename(name)
  # According to the error message you get when you try to upload a file with a
  # reserved character in the filename, crowdin filenames can't contain any of
  # the following characters: \ / : * ? " < > |
  return name.gsub(/[\\\/:\*\?"<>\|]/, '')
end

# Because all the course content is split up into small files for the purpose
# of making things easier for the translators, it becomes very difficult to
# redact all of them individually. To ameliorate that, we first gather all the
# strings we know we are going to want to redact from the course content into a
# file structure that mirrors the eventual file structure we're going to use
# when this data is consumed by rails.
#
# This means we can redact everything all in one place, then also restore
# things all in one place directly into the rails translation files at the end
# of the sync process.
def prepare_course_redaction_strings
  original_strings = Hash.new

  Dir.glob("dashboard/config/scripts/*.script").sort.each do |script_file|
    script_name = File.basename(script_file, ".*")
    next unless ScriptConstants.i18n?(script_name)

    script_data, _ = ScriptDSL.parse_file(script_file)
    script_data[:stages].each do |stage|
      stage[:scriptlevels].each do |script_level|
        level = script_level[:levels][0]
        level_name = level[:name]
        level_file = File.join("dashboard/config/scripts/levels", level_name + ".level")
        next unless File.exist? level_file
        File.open(level_file) do |level_data|
          level_xml = Nokogiri::XML(level_data, &:noblanks)
          config = JSON.parse(level_xml.xpath('//../config').first.text)
          next unless config["properties"].present?

          level_strings = {}

          if long_instructions = config["properties"]["long_instructions"]
            level_strings[:long_instructions] = sanitize(long_instructions)
          end

          if short_instructions = config["properties"]["short_instructions"]
            level_strings[:short_instructions] = sanitize(short_instructions)
          end

          if authored_hints_json = config["properties"]["authored_hints"]
            serialized_authored_hints = {}
            JSON.parse(authored_hints_json).each do |hint|
              next if hint['hint_id'].empty?
              next if hint['hint_markdown'].empty?
              serialized_authored_hints[hint['hint_id']] = hint['hint_markdown']
            end
            level_strings[:authored_hints] = serialized_authored_hints unless serialized_authored_hints.empty?
          end

          original_strings[level_name] = level_strings unless level_strings.empty?
        end
      end
    end
  end

  dest = "i18n/locales/original/course_content.json"
  puts "Writing #{original_strings.count} course content strings to redaction backup"
  FileUtils.mkdir_p(File.dirname(dest))
  File.open(dest, 'w') do |f|
    f.write(JSON.pretty_generate(original_strings))
  end
end

def serialize_and_redact_course_content
  course_content_dir = "i18n/locales/source/course_content"

  stdout, _status = Open3.capture2(
    'bin/i18n/node_modules/.bin/redact -c bin/i18n/plugins/nonCommonmarkLinebreak.js i18n/locales/original/course_content.json'
  )
  redacted_strings = JSON.parse(stdout)

  Dir.glob("dashboard/config/scripts/*.script").sort.each do |script_file|
    script_name = File.basename(script_file, ".*")
    next unless ScriptConstants.i18n?(script_name)

    script_data, _ = ScriptDSL.parse_file(script_file)

    if script_data[:family_name] && script_data[:version_year]
    elsif ScriptConstants.script_in_category?(:hoc, script_name)
      script_dir = File.join(course_content_dir, "Hour of Code", script_name)
    else
      script_dir = File.join(course_content_dir, "other", script_name)
    end

    script_data[:stages].each_with_index do |stage, stage_index|
      stage_display_index = format("%02d", stage_index + 1) # zero-pad and 1-index
      stage_display_name = sanitize_crowdin_filename("Lesson #{stage_display_index} - #{stage[:stage]}")
      stage[:scriptlevels].each_with_index do |script_level, level_index|
        level = script_level[:levels][0]
        level_name = level[:name]
        level_file = File.join("dashboard/config/scripts/levels", level_name + ".level")
        next unless File.exist? level_file

        level_display_index = format("%02d", level_index + 1) # zero-pad and 1-index
        level_display_name = "Puzzle #{level_display_index}"
        level_dir = File.join(script_dir, stage_display_name, level_display_name)
        FileUtils.mkdir_p(level_dir)

        level_url = "https://studio.code.org/s/#{script_name}/stage/#{stage_index + 1}/puzzle/#{level_index + 1}"

        File.open(level_file) do |level_data|
          level_xml = Nokogiri::XML(level_data, &:noblanks)
          config = JSON.parse(level_xml.xpath('//../config').first.text)
          next unless config["properties"].present?

          # Simple Properties
          %w(
            display_name
            short_instructions
            long_instructions
            failure_message_override
          ).each do |property_name|
            property_value = config["properties"][property_name]
            next unless property_value
            File.open(File.join(level_dir, "#{property_name}.json"), 'w') do |f|
              redacted_value = redacted_strings.
                try(:[], level_name).
                try(:[], property_name)

              f.write(
                JSON.pretty_generate(
                  {
                    property_name => {
                      message: sanitize(redacted_value || property_value),
                      description: level_url
                    }
                  }
                )
              )
            end
          end

          # JSON Properties

          ## Authored Hints
          if authored_hints_json = config["properties"]["authored_hints"]
            parsed = {}
            JSON.parse(authored_hints_json).each do |hint|
              redacted_value = redacted_strings.
                try(:[], level_name).
                try(:[], "authored_hints").
                try(:[], hint['hint_id'])

              next if hint['hint_id'].empty?
              parsed[hint['hint_id']] = {
                message: redacted_value || hint['hint_markdown'],
                description: level_url
              }
            end
            unless parsed.empty?
              File.open(File.join(level_dir, 'authored_hints.json'), 'w') do |f|
                f.write(JSON.pretty_generate(parsed))
              end
            end
          end

          ## Callouts
          if callouts_json = config["properties"]["callout_json"]
            parsed = {}
            JSON.parse(callouts_json).each do |callout|
              next if callout['localization_key'].empty?
              parsed[callout['localization_key']] = {
                message: callout['callout_text'],
                description: level_url
              }
            end
            unless parsed.empty?
              File.open(File.join(level_dir, 'callouts.json'), 'w') do |f|
                f.write(JSON.pretty_generate(parsed))
              end
            end
          end
        end
      end
    end
  end
end

def localize_levels_blocks_content
  level_block_categories = Hash.new
  level_function_names = Hash.new

  Dir.glob("dashboard/config/scripts/levels/*.level").sort.each do |file|
    File.open(file) do |data|
      level_xml = Nokogiri::XML(data, &:noblanks)
      blocks = level_xml.xpath('//blocks').first
      next unless blocks

      ## Categories
      blocks.xpath('//category').each do |category|
        name = category.attr('name')
        level_block_categories[name] = name if name
      end

      ## Function Names
      blocks.xpath("//block[@type=\"procedures_defnoreturn\"]").each do |function|
        name = function.at_xpath('./title[@name="NAME"]')
        level_function_names[name.content] = name.content if name
      end
    end
  end

  copy_to_yml("block_categories", level_block_categories)
  copy_to_yml("function_names", level_function_names)
end

sync_in if __FILE__ == $0
