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
  plugins.map {|name| "bin/i18n/plugins/#{name}.js"}.join(',')
end

def redact(source, dest, *plugins)
  return unless File.exist? source
  FileUtils.mkdir_p File.dirname(dest)

  plugins = plugins_to_arg(plugins)
  data = YAML.load_file(source)
  stdout, _status = Open3.capture2(
    [
      'bin/i18n/node_modules/.bin/redact',
      '-c bin/i18n/plugins/nonCommonmarkLinebreak.js',
      '-p ' + plugins,
    ].join(" "),
    stdin_data: JSON.generate(data)
  )
  data = JSON.parse(stdout)
  File.open(dest, "w+") do |file|
    file.write(to_crowdin_yaml(data))
  end
end

def restore(source, redacted, dest, *plugins)
  return unless File.exist?(source)
  return unless File.exist?(redacted)

  plugins = plugins_to_arg(plugins)
  source_data = YAML.load_file(source)
  redacted_data = YAML.load_file(redacted)
  source_json = Tempfile.new(['source', '.json'])
  redacted_json = Tempfile.new(['redacted', '.json'])

  source_json.write(JSON.generate(source_data.values.first))
  redacted_json.write(JSON.generate(redacted_data.values.first))

  source_json.flush
  redacted_json.flush

  stdout, _status = Open3.capture2(
    [
      'bin/i18n/node_modules/.bin/restore',
      '-c bin/i18n/plugins/nonCommonmarkLinebreak.js',
      '-p ' + plugins,
      "-s #{source_json.path}",
      "-r #{redacted_json.path}",
    ].join(" ")
  )
  redacted_key = redacted_data.keys.first
  restored_data = {}
  restored_data[redacted_key] = JSON.parse(stdout)
  File.open(dest, "w+") do |file|
    file.write(to_crowdin_yaml(restored_data))
  end

  source_json.close
  redacted_json.close
end
