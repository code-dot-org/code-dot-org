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
  run_bash_script "bin/i18n-codeorg/in.sh"
end

def copy_to_yml(label, data, allow_full_length=true)
  args = allow_full_length ? {line_width: -1} : {}
  File.open("dashboard/config/locales/#{label}.en.yml", "w+") do |f|
    data = ({"en" => {"data" => {label => data}}}).to_yaml(**args)
    f.write(data)
  end
end

# sanitize a string before uploading to crowdin. Currently only performs
# CRLF -> LF conversion, but could be extended to do more
def sanitize(string)
  return string.gsub(/\\r(\\n)?/, "\\n")
end

# Pull in various fields for levelbuilder levels from .level files and
# save them to [field_name].en.yml files to be translated. Fields included:
#   instructions
#   markdown instructions
#   failure message override
#   authored hints
#   callouts
def localize_level_content
  level_instructions = Hash.new
  level_markdown_instructions = Hash.new
  level_failure_message_overrides = Hash.new
  level_authored_hints = Hash.new
  level_callouts = Hash.new

  Dir.glob("dashboard/config/scripts/levels/*.level").sort.each do |file|
    level_name = File.basename(file, ".*")
    File.open(file) do |data|
      level_xml = Nokogiri::XML(data, &:noblanks)
      config = JSON.parse(level_xml.xpath('//../config').first.text)

      # Instructions
      if instructions = config["properties"]["instructions"]
        level_instructions["#{level_name}_instruction"] = sanitize(instructions)
      end

      # Markdown Instructions
      if markdown_instructions = config["properties"]["markdown_instructions"]
        level_markdown_instructions["#{level_name}_markdown_instruction"] = sanitize(markdown_instructions)
      end

      # Failure message overrides
      if failure_message_overrides = config["properties"]["failure_message_override"]
        level_failure_message_overrides["#{level_name}_failure_message_override"] = sanitize(failure_message_overrides)
      end

      # Authored Hints
      if authored_hints_json = config["properties"]["authored_hints"]
        level_authored_hints["#{level_name}_authored_hint"] = JSON.parse(authored_hints_json).reduce({}) do |memo, hint|
          memo[hint['hint_id']] = hint['hint_markdown'] unless hint['hint_id'].empty?
          memo
        end
      end

      # Callouts
      if callouts_json = config["properties"]["callout_json"]
        level_callouts["#{level_name}_callout"] = JSON.parse(callouts_json).reduce({}) do |memo, callout|
          memo[callout['localization_key']] = callout['callout_text'] unless callout['localization_key'].empty?
          memo
        end
      end
    end
  end

  copy_to_yml("instructions", level_instructions)
  copy_to_yml("markdown_instructions", level_markdown_instructions)
  copy_to_yml("failure_message_overrides", level_failure_message_overrides)
  copy_to_yml("authored_hints", level_authored_hints)
  copy_to_yml("callouts", level_callouts)
end

sync_in if __FILE__ == $0
