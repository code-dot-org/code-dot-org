#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'fileutils'
require 'json'
require 'yaml'
require 'tempfile'

require_relative 'i18n_script_utils'

def sync_in
  localize_level_content
  localize_block_content
  run_bash_script "bin/i18n-codeorg/in.sh"
  localize_pegasus_markdown_content
  # disable redaction of level content until the switch to remark is complete
  #redact_level_content
  redact_block_content
end

def localize_pegasus_markdown_content
  # The in script grabs all the serialized pegasus strings, but we also want to
  # localize some markdown pages. As of September 2018, there is exactly one
  # page we want to localize, but we expect there to be more eventually.
  markdown_to_localize = %w(
    educate/curriculum/csf-transition-guide
  ).freeze

  src_dir = 'pegasus/sites.v3/code.org/public'.freeze
  dest_dir = 'i18n/locales/source/pegasus/public'.freeze

  # If we wanted to preprocess the markdown before it goes into crowdin (for
  # example, to strip out the YAML header or perform redaction), right here is
  # where we would likely do it.
  markdown_to_localize.each do |md|
    src_file = File.join src_dir, "#{md}.md"
    dest_file = File.join dest_dir, "#{md}.md"
    FileUtils.mkdir_p File.dirname(dest_file)
    FileUtils.cp src_file, dest_file
  end
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

def redact_block_content
  source = 'i18n/locales/source/dashboard/blocks.yml'
  dest = 'i18n/locales/redacted/dashboard/blocks.yml'
  redact(source, dest, 'blockfield')
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

def redact_level_content
  FileUtils.mkdir_p 'i18n/locales/redacted/dashboard'
  puts "Redacting"
  %w(
    authored_hints
    short_instructions
    long_instructions
  ).each do |content_type|
    puts "\t#{content_type}"
    source = "i18n/locales/source/dashboard/#{content_type}.yml"
    dest = "i18n/locales/redacted/dashboard/#{content_type}.yml"
    redact(source, dest)
  end
end

# Pull in various fields for levelbuilder levels from .level files and
# save them to [field_name].en.yml files to be translated. Fields included:
#   short instructions
#   long instructions
#   failure message override
#   authored hints
#   callouts
#
# See Blockly.get_localized_property in dashboard models for usage
def localize_level_content
  level_display_name = Hash.new
  level_short_instructions = Hash.new
  level_long_instructions = Hash.new
  level_failure_message_overrides = Hash.new
  level_authored_hints = Hash.new
  level_callouts = Hash.new
  level_block_categories = Hash.new
  level_function_names = Hash.new

  Dir.glob("dashboard/config/scripts/levels/*.level").sort.each do |file|
    level_name = File.basename(file, ".*")
    File.open(file) do |data|
      level_xml = Nokogiri::XML(data, &:noblanks)

      # Properties
      config = JSON.parse(level_xml.xpath('//../config').first.text)

      ## Display Name
      if display_name = config["properties"]["display_name"]
        level_display_name[level_name] = sanitize(display_name)
      end

      ## Instructions
      if short_instructions = (config["properties"]["short_instructions"] || config["properties"]["instructions"])
        level_short_instructions[level_name] = sanitize(short_instructions)
      end

      ## Markdown Instructions
      if long_instructions = (config["properties"]["long_instructions"] || config["properties"]["markdown_instructions"])
        level_long_instructions[level_name] = sanitize(long_instructions)
      end

      ## Failure message overrides
      if failure_message_overrides = config["properties"]["failure_message_override"]
        level_failure_message_overrides["#{level_name}_failure_message_override"] = sanitize(failure_message_overrides)
      end

      ## Authored Hints
      if authored_hints_json = config["properties"]["authored_hints"]
        level_authored_hints["#{level_name}_authored_hint"] = JSON.parse(authored_hints_json).reduce({}) do |memo, hint|
          memo[hint['hint_id']] = hint['hint_markdown'] unless hint['hint_id'].empty?
          memo
        end
      end

      ## Callouts
      if callouts_json = config["properties"]["callout_json"]
        level_callouts["#{level_name}_callout"] = JSON.parse(callouts_json).reduce({}) do |memo, callout|
          memo[callout['localization_key']] = callout['callout_text'] unless callout['localization_key'].empty?
          memo
        end
      end

      # Blocks
      blocks = level_xml.xpath('//blocks').first
      if blocks
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
  end

  copy_to_yml("display_name", level_display_name)
  copy_to_yml("short_instructions", level_short_instructions)
  copy_to_yml("long_instructions", level_long_instructions)
  copy_to_yml("failure_message_overrides", level_failure_message_overrides)
  copy_to_yml("authored_hints", level_authored_hints)
  copy_to_yml("callouts", level_callouts)
  copy_to_yml("block_categories", level_block_categories)
  copy_to_yml("function_names", level_function_names)
end

sync_in if __FILE__ == $0
