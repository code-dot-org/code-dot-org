require 'json'
require 'open3'
require 'shellwords'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'

class RedactRestoreUtils
  def self.redact_file(source_path, plugins=[], format='md')
    args = ['bin/i18n/node_modules/.bin/redact']
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push(Shellwords.escape(source_path))
    stdout, _status = Open3.capture2(args.join(" "))

    return JSON.parse(stdout)
  end

  def self.restore_file(source_path, redacted_path, plugins=[], format='md')
    args = ['bin/i18n/node_modules/.bin/restore']
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push("-s #{Shellwords.escape(source_path)}")
    args.push("-r #{Shellwords.escape(redacted_path)}")

    stdout, _status = Open3.capture2(args.join(" "))

    return JSON.parse(stdout)
  end

  def self.redact_data(source_data, plugins=[], format='md')
    args = ['bin/i18n/node_modules/.bin/redact']
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")

    stdout, _status = Open3.capture2(
      args.join(" "),
      stdin_data: JSON.generate(source_data)
    )

    return JSON.parse(stdout)
  end

  def self.restore_data(source_data, redacted_data, plugins=[], format='md')
    source_json = Tempfile.new(['source', '.json'])
    redacted_json = Tempfile.new(['redacted', '.json'])

    source_json.write(JSON.generate(source_data))
    redacted_json.write(JSON.generate(redacted_data))

    source_json.flush
    redacted_json.flush

    restored = RedactRestoreUtils.restore_file(source_json.path, redacted_json.path, plugins, format)

    source_json.close
    redacted_json.close

    return restored
  end

  def self.restore(source, redacted, dest, plugins=[], format='md')
    return unless File.exist?(source)
    return unless File.exist?(redacted)
    is_json = File.extname(source) == '.json'
    source_data =
      if is_json
        JSON.load(File.open(source, 'r'))
      else
        YAML.load_file(source)
      end
    redacted_data =
      if is_json
        JSON.load(File.open(redacted, 'r'))
      else
        YAML.load_file(redacted)
      end

    return unless source_data
    return unless redacted_data
    return unless source_data&.values&.first&.length
    return unless redacted_data&.values&.first&.length

    restored =
      if is_json
        RedactRestoreUtils.restore_data(source_data, redacted_data, plugins, format)
      else
        RedactRestoreUtils.restore_data(source_data.values.first, redacted_data.values.first, plugins, format)
      end

    File.open(dest, "w+") do |file|
      if File.extname(dest) == '.json'
        file.write(JSON.pretty_generate(restored))
      else
        redacted_key = redacted_data.keys.first
        file.write(
          I18nScriptUtils.to_crowdin_yaml(
            {
              redacted_key => restored
            }
          )
        )
      end
    end
  end

  def self.redact(source, dest, plugins=[], format='md')
    return unless File.exist? source
    FileUtils.mkdir_p File.dirname(dest)

    source_data =
      if File.extname(source) == '.json'
        f = File.open(source, 'r')
        JSON.load(f)
      else
        YAML.load_file(source)
      end

    redacted = RedactRestoreUtils.redact_data(source_data, plugins, format)

    File.open(dest, "w+") do |file|
      if File.extname(dest) == '.json'
        file.write(JSON.pretty_generate(redacted))
      else
        file.write(I18nScriptUtils.to_crowdin_yaml(redacted))
      end
    end
  end

  private_class_method def self.plugins_to_arg(plugins)
    plugins.map {|name| "bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{name}.js" if name}.join(',')
  end
end
