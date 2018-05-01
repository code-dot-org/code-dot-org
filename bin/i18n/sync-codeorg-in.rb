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

def reformat_quotes
  filenames = [
    "instructions",
    "markdown_instructions",
    'failure_message_overrides',
  ]

  filenames.each do |filename|
    temp_file = Tempfile.new("temp#{filename}.yml")
    File.open("dashboard/config/locales/#{filename}.en.yml", "r") do |f|
      f.each_line {|line| temp_file.puts line.gsub("'\"", '"').gsub("\"'", '"').gsub("''", "'")}
    end
    temp_file.close
    FileUtils.mv(temp_file.path, "dashboard/config/locales/#{filename}.en.yml")
  end
end

# sanitize a string before uploading to crowdin. Currently only performs
# CRLF -> LF conversion, but could be extended to do more
def sanitize(string)
  return string.gsub(/\r\n?/, "\n");
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

  instruction_pattern = /^\s*"instructions": (".*?"),?\n$/
  markdown_instruction_pattern = /^\s*"markdown_instructions": (".*?"),?\n$/
  failure_message_override_pattern = /^\s*"failure_message_override": (".*?"),?\n$/
  authored_hint_pattern = /^\s*"authored_hints": "(.*?)",?\n$/
  callout_pattern = /^\s*"callout_json": "(.*?)",?\n$/

  Dir.glob("dashboard/config/scripts/levels/*.level").sort.each do |file|
    level = File.basename(file, ".*") + "_instruction"
    markdown_level = File.basename(file, ".*") + "_markdown_instruction"
    failure_message_override_level = File.basename(file, ".*") + "_failure_message_override"
    authored_hint_level = File.basename(file, ".*") + "_authored_hint"
    callout_level = File.basename(file, ".*") + "_callout"

    File.open(file) do |f|
      f.each_line do |line|
        # Instructions
        instruction_match = line.match instruction_pattern
        if instruction_match
          level_instructions[level] = sanitize instruction_match.captures.first
        end

        # Markdown Instructions
        markdown_instruction_match = line.match markdown_instruction_pattern
        if markdown_instruction_match
          level_markdown_instructions[markdown_level] = sanitize markdown_instruction_match.captures.first
        end

        # Failure message overrides
        failure_message_override_match = line.match failure_message_override_pattern
        if failure_message_override_match
          level_failure_message_overrides[failure_message_override_level] = failure_message_override_match.captures.first
        end

        # Authored Hints
        authored_hint_match = line.match authored_hint_pattern
        if authored_hint_match
          hint_json = JSON.load(%Q("#{authored_hint_match.captures.first}"))
          level_authored_hints[authored_hint_level] = JSON.parse(hint_json).reduce({}) do |memo, hint|
            memo[hint['hint_id']] = hint['hint_markdown'] unless hint['hint_id'].empty?
            memo
          end
        end

        # Callouts
        callout_match = line.match callout_pattern
        next unless callout_match
        callout_json = JSON.load(%Q("#{callout_match.captures.first}"))
        level_callouts[callout_level] = JSON.parse(callout_json).reduce({}) do |memo, callout|
          memo[callout['localization_key']] = callout['callout_text'] unless callout['localization_key'].empty?
          memo
        end
      end
    end
  end

  copy_to_yml("instructions", level_instructions)
  copy_to_yml("markdown_instructions", level_markdown_instructions)
  copy_to_yml("failure_message_overrides", level_failure_message_overrides)
  copy_to_yml("authored_hints", level_authored_hints, true)
  copy_to_yml("callouts", level_callouts, true)
  reformat_quotes
end

sync_in if __FILE__ == $0
