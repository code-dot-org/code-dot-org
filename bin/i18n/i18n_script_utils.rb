require 'open3'
require 'tempfile'

CODEORG_CONFIG_FILE = File.join(File.dirname(__FILE__), "codeorg_crowdin.yml")
CODEORG_IDENTITY_FILE = File.join(File.dirname(__FILE__), "codeorg_credentials.yml")
HOUROFCODE_CONFIG_FILE = File.join(File.dirname(__FILE__), "hourofcode_crowdin.yml")
HOUROFCODE_IDENTITY_FILE = File.join(File.dirname(__FILE__), "hourofcode_credentials.yml")

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
    file.write(data.to_yaml(line_width: -1))
  end
end

def restore(source, redacted, dest, *plugins)
  plugins = plugins_to_arg(plugins)
  source_data = YAML.load_file(source)
  redacted_data = YAML.load_file(redacted)
  source_json = Tempfile.new(['source', '.json'])
  redacted_json = Tempfile.new(['redacted', '.json'])

  source_json.write(JSON.generate(source_data))
  redacted_json.write(JSON.generate(redacted_data))

  stdout, _status = Open3.capture2(
    [
      'bin/i18n/node_modules/.bin/restore',
      '-c bin/i18n/plugins/nonCommonmarkLinebreak.js',
      '-p ' + plugins,
      "-s #{source_json.path}",
      "-r #{redacted_json.path}",
    ].join(" ")
  )
  restored_data = JSON.parse(stdout)
  File.open(dest, "w+") do |file|
    file.write(restored_data.to_yaml(line_width: -1))
  end

  source_json.close
  redacted_json.close
end
