require File.expand_path('../../../dashboard/config/environment', __FILE__)

require 'cdo/google_drive'
require 'cgi'
require 'fileutils'
require 'psych'

CODEORG_CONFIG_FILE = File.join(File.dirname(__FILE__), "codeorg_crowdin.yml")
CODEORG_IDENTITY_FILE = File.join(File.dirname(__FILE__), "codeorg_credentials.yml")
HOUROFCODE_CONFIG_FILE = File.join(File.dirname(__FILE__), "hourofcode_crowdin.yml")
HOUROFCODE_IDENTITY_FILE = File.join(File.dirname(__FILE__), "hourofcode_credentials.yml")
CODEORG_MARKDOWN_CONFIG_FILE = File.join(File.dirname(__FILE__), "codeorg_markdown_crowdin.yml")
CODEORG_MARKDOWN_IDENTITY_FILE = File.join(File.dirname(__FILE__), "codeorg_markdown_credentials.yml")

# Output the given data to YAML that will be consumed by Crowdin. Includes a
# couple changes to the default `data.to_yaml` serialization:
#
#   1. Don't wrap lines. This is an optional feature provided by yaml, intended
#      to make human editing of the serialized data easier. Because this data
#      is only managed programmatically, we avoid wrapping to make the git
#      diffs smaller and change detection easier.
#
#   2. Quote 'y' and 'n'. Psych intentionally departs from the YAML spec for
#      these strings: https://github.com/ruby/psych/blob/8e880f7837db9ed66032a1dddc85444a1514a1e3/test/psych/test_boolean.rb#L21-L35
#      But Crowdin sticks strictly to the YAML spec, so here we add special
#      logic to ensure that we conform to the spec when outputting for Crowdin
#      consumption.
#      See https://github.com/gvvaughan/lyaml/issues/8#issuecomment-123132430
def to_crowdin_yaml(data)
  ast = Psych.parse_stream(Psych.dump(data))

  # Make sure we treat the strings 'y' and 'n' as strings, and not bools
  yaml_bool = /^(?:y|Y|n|N)$/
  ast.grep(Psych::Nodes::Scalar).each do |node|
    if yaml_bool.match node.value
      node.plain = false
      node.quoted = true
    end
  end

  return ast.yaml(nil, {line_width: -1})
end

def should_i(question)
  loop do
    print "Should I #{question}? [Yes]/Skip/Quit: "
    response = gets.strip.downcase
    puts ''
    if 'yes'.start_with?(response) # also catches blank/return ;)
      return true
    elsif 'skip'.start_with?(response) || 'no'.start_with?(response)
      return false
    elsif 'quit'.start_with?(response)
      puts "quitting"
      exit(-1)
    else
      puts "Sorry, I didn't understand that.\n\n"
    end
  end
end

def git_add_and_commit(paths, commit_message)
  paths.each do |path|
    `git add -u #{path}`
  end
  `git commit -m "#{commit_message}"`
end

def run_standalone_script(location)
  Open3.popen3(location) do |_stdin, stdout, stderr, _wait_thread|
    while line = stdout.gets
      puts(line)
    end
    while line = stderr.gets
      puts(line)
    end
  end
end

def run_bash_script(location)
  run_standalone_script("bash #{location}")
end

def report_malformed_restoration(key, translation, file_name)
  @malformed_restorations ||= [["Key", "File Name", "Translation"]]
  @malformed_restorations << [key, file_name, translation]
end

def upload_malformed_restorations(locale)
  return if @malformed_restorations.blank?
  Google::Drive.new.add_sheet_to_spreadsheet(@malformed_restorations, "i18n_bad_translations", locale)
  @malformed_restorations = nil
end

def recursively_find_malformed_links_images(hash, key_str, file_name)
  hash.each do |key, val|
    if val.is_a?(Hash)
      recursively_find_malformed_links_images(val, "#{key_str}.#{key}", file_name)
    else
      report_malformed_restoration("#{key_str}.#{+key}", val, file_name) if contains_malformed_link_or_image(val)
    end
  end
end

# This function currently looks for
# 1. Translations with malformed redaction syntax, i.e. [] [0] (note the space)
# 2. Translations with similarly malformed markdown, i.e. [link] (example.com)
# If this function finds either of these cases in the string, it return true.
def contains_malformed_link_or_image(translation)
  malformed_redaction_regex = /\[.*\]\s+\[[0-9]+\]/
  malformed_markdown_regex = /\[.*\]\s+\(.+\)/
  non_malformed_redaction = (translation =~ malformed_redaction_regex).nil?
  non_malformed_translation = (translation =~ malformed_markdown_regex).nil?
  return !(non_malformed_redaction && non_malformed_translation)
end

def get_level_url_key(script, level)
  script_name = script.name
  script_level = level.script_levels.find_by_script_id(script.id)
  if script_level.bonus
    escaped_level_name = CGI.escape(level.name)
    "https://studio.code.org/s/#{script_name}/stage/#{script_level.stage.relative_position}/extras?level_name=#{escaped_level_name}"
  else
    "https://studio.code.org/s/#{script_name}/stage/#{script_level.stage.relative_position}/puzzle/#{script_level.position}"
  end
end

def get_level_from_url(url)
  url_regex = %r{https://studio.code.org/s/(?<script_name>[A-Za-z0-9\s\-_]+)/stage/(?<stage_pos>[0-9]+)/(?<level_info>.+)}
  matches = url.match(url_regex)
  if matches[:level_info].starts_with?("extras")
    level_info_regex = %r{extras\?level_name=(?<level_name>.+)}
    level_name = matches[:level_info].match(level_info_regex)[:level_name]
    Level.find_by_name(CGI.unescape(level_name))
  else
    script = Script.find_by_name(matches[:script_name])
    stage = script.stages.find_by_relative_position(matches[:stage_pos])
    level_info_regex = %r{puzzle/(?<level_pos>[0-9]+)}
    level_pos = matches[:level_info].match(level_info_regex)[:level_pos]
    stage.script_levels.find_by_position(level_pos.to_i).oldest_active_level
  end
end
