require File.expand_path('../../../dashboard/config/environment', __FILE__)

require 'fileutils'
require 'open3'
require 'psych'
require 'tempfile'

CODEORG_CONFIG_FILE = File.join(File.dirname(__FILE__), "codeorg_crowdin.yml")
CODEORG_IDENTITY_FILE = File.join(File.dirname(__FILE__), "codeorg_credentials.yml")
HOUROFCODE_CONFIG_FILE = File.join(File.dirname(__FILE__), "hourofcode_crowdin.yml")
HOUROFCODE_IDENTITY_FILE = File.join(File.dirname(__FILE__), "hourofcode_credentials.yml")
CODEORG_MARKDOWN_CONFIG_FILE = File.join(File.dirname(__FILE__), "codeorg_markdown_crowdin.yml")
CODEORG_MARKDOWN_IDENTITY_FILE = File.join(File.dirname(__FILE__), "codeorg_markdown_credentials.yml")

KEYS_TO_REDACT = ['authored_hints', 'long_instructions', 'short_instructions']

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

def plugins_to_arg(plugins)
  plugins.map {|name| "bin/i18n/plugins/#{name}.js" if name}.join(',')
end

def redact_course_content(source, dest, original, *plugins)
  return unless File.exist? source
  FileUtils.mkdir_p File.dirname(dest)
  FileUtils.mkdir_p File.dirname(original)
  plugins = plugins_to_arg(plugins)
  source_file = File.open(source, 'r')
  source_data = JSON.load(source_file)
  data = source_data.select {|key, _value| KEYS_TO_REDACT.include? key}

  File.open(original, "w+") do |file|
    file.write(JSON.pretty_generate(data))
  end

  args = ['bin/i18n/node_modules/.bin/redact',
          '-c bin/i18n/plugins/nonCommonmarkLinebreak.js']
  args.push('-p ' + plugins) unless plugins.empty?

  stdout, _status = Open3.capture2(
    args.join(" "),
    stdin_data: JSON.generate(data)
  )
  redacted_data = JSON.parse(stdout)
  KEYS_TO_REDACT.each do |k|
    source_data[k] = redacted_data[k]
  end

  File.open(dest, "w+") do |file|
    file.write(JSON.pretty_generate(source_data))
  end
end

def redact(source, dest, *plugins)
  return unless File.exist? source
  FileUtils.mkdir_p File.dirname(dest)

  plugins = plugins_to_arg(plugins)
  data =
    if File.extname(source) == '.json'
      f = File.open(source, 'r')
      JSON.load(f)
    else
      YAML.load_file(source)
    end

  args = ['bin/i18n/node_modules/.bin/redact',
          '-c bin/i18n/plugins/nonCommonmarkLinebreak.js']
  args.push('-p ' + plugins) unless plugins.empty?

  stdout, _status = Open3.capture2(
    args.join(" "),
    stdin_data: JSON.generate(data)
  )
  data = JSON.parse(stdout)
  File.open(dest, "w+") do |file|
    if File.extname(dest) == '.json'
      file.write(JSON.pretty_generate(data))
    else
      file.write(to_crowdin_yaml(data))
    end
  end
end

def restore(source, redacted, dest, *plugins)
  return unless File.exist?(source)
  return unless File.exist?(redacted)
  is_json = File.extname(source) == '.json'
  source_data =
    if is_json
      f = File.open(source, 'r')
      JSON.load(f)
    else
      YAML.load_file(source)
    end
  redacted_data =
    if is_json
      f = File.open(redacted, 'r')
      JSON.load(f)
    else
      YAML.load_file(redacted)
    end

  return unless source_data&.values&.first&.length
  return unless redacted_data&.values&.first&.length

  source_json = Tempfile.new(['source', '.json'])
  redacted_json = Tempfile.new(['redacted', '.json'])

  if is_json
    source_json.write(JSON.generate(source_data))
    redacted_json.write(JSON.generate(redacted_data))
  else
    source_json.write(JSON.generate(source_data.values.first))
    redacted_json.write(JSON.generate(redacted_data.values.first))
  end

  source_json.flush
  redacted_json.flush

  args = ['bin/i18n/node_modules/.bin/restore',
          '-c bin/i18n/plugins/nonCommonmarkLinebreak.js']
  plugins = plugins_to_arg(plugins)
  args.push('-p ' + plugins) unless plugins.empty?

  args.push("-s #{source_json.path}")
  args.push("-r #{redacted_json.path}")
  stdout, _status = Open3.capture2(
    args.join(" ")
  )
  redacted_key = redacted_data.keys.first
  restored_data = {}
  File.open(dest, "w+") do |file|
    if File.extname(dest) == '.json'
      restored_data = JSON.parse(stdout)
      file.write(JSON.pretty_generate(restored_data))
    else
      restored_data[redacted_key] = JSON.parse(stdout)
      file.write(to_crowdin_yaml(restored_data))
    end
  end

  source_json.close
  redacted_json.close
end

def restore_course_content(source, redacted, dest, *plugins)
  return unless File.exist?(source)
  return unless File.exist?(redacted)
  source_file = File.open(source, 'r')
  redacted_file = File.open(redacted, 'r')
  source_data = JSON.load(source_file)
  translated_data = JSON.load(redacted_file)
  redacted_data = translated_data.select {|key, _value| KEYS_TO_REDACT.include? key}

  return unless source_data&.values&.first&.length
  return unless redacted_data&.values&.first&.length

  source_json = Tempfile.new(['source', '.json'])
  redacted_json = Tempfile.new(['redacted', '.json'])

  source_json.write(JSON.generate(source_data))
  redacted_json.write(JSON.generate(redacted_data))

  source_json.flush
  redacted_json.flush

  args = ['bin/i18n/node_modules/.bin/restore',
          '-c bin/i18n/plugins/nonCommonmarkLinebreak.js']
  plugins = plugins_to_arg(plugins)
  args.push('-p ' + plugins) unless plugins.empty?

  args.push("-s #{source_json.path}")
  args.push("-r #{redacted_json.path}")
  stdout, _status = Open3.capture2(
    args.join(" ")
  )
  restored_data = {}
  restored_data = JSON.parse(stdout)
  KEYS_TO_REDACT.each do |k|
    translated_data[k] = restored_data[k]
  end
  File.open(dest, "w+") do |file|
    file.write(JSON.pretty_generate(translated_data))
  end

  source_json.close
  redacted_json.close
end

def get_level_url_key(script, level)
  script_name = script.name
  script_level = level.script_levels.find_by_script_id(script.id)
  if script_level.bonus
    "https://studio.code.org/s/#{script_name}/stage/#{script_level.stage.relative_position}/extras?level_name=#{level.name}"
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
    Level.find_by_name(level_name)
  else
    script = Script.find_by_name(matches[:script_name])
    stage = script.stages.find_by_relative_position(matches[:stage_pos])
    level_info_regex = %r{puzzle/(?<level_pos>[0-9]+)}
    level_pos = matches[:level_info].match(level_info_regex)[:level_pos]
    stage.script_levels.find_by_position(level_pos.to_i).level
  end
end
