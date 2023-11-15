require 'json'
require 'open3'
require 'shellwords'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'

class RedactRestoreUtils
  def self.backup_file(source_path)
    backup_path = source_path.gsub(/\/source\//, '/original/')
    I18nScriptUtils.copy_file(source_path, backup_path)
  end

  # For a given file, redact returns the redacted content of the file. The default file format is Markdown.
  def self.redact(source_path, plugins = [], format = 'md')
    args = [CDO.dir('bin/i18n/node_modules/.bin/redact')]
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push(Shellwords.escape(source_path))

    stdout, _status = Open3.capture2(args.join(" "))

    return stdout
  end

  def self.restore(source_path, redacted_path, plugins = [], format = 'md')
    args = [CDO.dir('bin/i18n/node_modules/.bin/restore')]
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push("-s #{Shellwords.escape(source_path)}")
    args.push("-r #{Shellwords.escape(redacted_path)}")

    stdout, _status = Open3.capture2(args.join(" "))

    return stdout
  end

  # Given a Hash object, redact_data returns the redacted version of that Hash object.
  def self.redact_data(source_data, plugins = [], format = 'md')
    args = [CDO.dir('bin/i18n/node_modules/.bin/redact')]
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")

    stdout, _status = Open3.capture2(
      args.join(" "),
      stdin_data: JSON.generate(source_data)
    )

    return JSON.parse(stdout)
  end

  def self.restore_data(source_data, redacted_data, plugins = [], format = 'md')
    source_json = Tempfile.new(['source', '.json'])
    redacted_json = Tempfile.new(['redacted', '.json'])

    source_json.write(JSON.generate(source_data))
    redacted_json.write(JSON.generate(redacted_data))

    source_json.flush
    redacted_json.flush

    restored = RedactRestoreUtils.restore(source_json.path, redacted_json.path, plugins, format)

    source_json.close
    redacted_json.close

    return JSON.parse(restored)
  end

  def self.restore_file(source, redacted, dest, plugins = [], format = 'md')
    return unless File.exist?(source)
    return unless File.exist?(redacted)
    file_format = File.extname(source)

    if file_format == '.json'
      source_data = JSON.load_file(source)
      redacted_data = JSON.load_file(redacted)

      return unless source_data
      return unless redacted_data
      return unless source_data&.values&.first&.length
      return unless redacted_data&.values&.first&.length

      restored = RedactRestoreUtils.restore_data(source_data, redacted_data, plugins, format)

    elsif file_format == '.yml'
      source_data = YAML.load_file(source)
      redacted_data = YAML.load_file(redacted)

      return unless source_data
      return unless redacted_data
      return unless source_data&.values&.first&.length
      return unless redacted_data&.values&.first&.length

      restored = RedactRestoreUtils.restore_data(source_data.values.first, redacted_data.values.first, plugins, format)

    else
      restored = RedactRestoreUtils.restore(source, redacted, plugins, format)
    end

    File.open(dest, "w+") do |file|
      if File.extname(dest) == '.json'
        file.write(JSON.pretty_generate(restored))
      elsif File.extname(dest) == '.yml'
        redacted_key = redacted_data.keys.first
        restored = {redacted_key => restored}
        file.write(I18nScriptUtils.to_crowdin_yaml(restored))
      else
        file.write(restored)
      end
    end

    restored
  end

  # redact_file redacts the content of the source file, whether is a json, yml or other formats and write the output
  # into the dest file.
  def self.redact_file(source, dest, plugins = [], format = 'md')
    return unless File.exist? source
    FileUtils.mkdir_p File.dirname(dest)

    file_format = File.extname(source)

    if file_format == '.json'
      source_data = JSON.load_file(source)
      redacted = RedactRestoreUtils.redact_data(source_data, plugins, format)
    elsif file_format == '.yml'
      source_data = YAML.load_file(source)
      redacted = RedactRestoreUtils.redact_data(source_data, plugins, format)
    else
      redacted = RedactRestoreUtils.redact(source_data, plugins, format)
    end

    File.open(dest, "w+") do |file|
      if File.extname(dest) == '.json'
        file.write(JSON.pretty_generate(redacted))
      elsif File.extname(dest) == '.yml'
        file.write(I18nScriptUtils.to_crowdin_yaml(redacted))
      else
        file.write(redacted)
      end
    end
  end

  private_class_method def self.plugins_to_arg(plugins)
    plugins.map {|name| CDO.dir("bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{name}.js") if name}.join(',')
  end
end
