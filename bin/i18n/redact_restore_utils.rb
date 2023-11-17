require 'json'
require 'open3'
require 'shellwords'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'

class RedactRestoreUtils
  # RedactRestoreUtils manages the
  def self.backup_source_file(source_path)
    return unless File.exist?(source_path)
    return unless source_path[I18N_SOURCE_DIR]
    backup_path = source_path.sub(I18N_SOURCE_DIR, I18N_ORIGINAL_DIR)
    I18nScriptUtils.copy_file(source_path, backup_path)
  end

  # For a given file, redact_file returns the redacted content of the file. The default file format is Markdown.
  def self.redact_file(source_path, plugins = [], format = 'md')
    args = [CDO.dir('bin/i18n/node_modules/.bin/redact')]
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push(Shellwords.escape(source_path))

    stdout, _status = Open3.capture2(args.join(" "))

    return stdout
  end

  def self.restore_file(source_path, redacted_path, plugins = [], format = 'md')
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

    restored = RedactRestoreUtils.restore_file(source_json.path, redacted_json.path, plugins, format)

    source_json.close
    redacted_json.close

    return JSON.parse(restored)
  end

  def self.restore(source, redacted, dest, plugins = [], format = 'md')
    return unless File.exist?(source)
    return unless File.exist?(redacted)

    if I18nScriptUtils.json_file?(source)
      source_data = I18nScriptUtils.parse_file(source)
      redacted_data = I18nScriptUtils.parse_file(redacted)

      return unless source_data
      return unless redacted_data
      return unless source_data&.values&.first&.length
      return unless redacted_data&.values&.first&.length

      restored = RedactRestoreUtils.restore_data(source_data, redacted_data, plugins, format)
      I18nScriptUtils.write_yaml_file(dest, redacted)

    elsif I18nScriptUtils.yaml_file?(source)
      source_data = I18nScriptUtils.parse_file(source)
      redacted_data = I18nScriptUtils.parse_file(redacted)

      return unless source_data
      return unless redacted_data
      return unless source_data&.values&.first&.length
      return unless redacted_data&.values&.first&.length
      puts source_data
      source_data.values.first
      restored = RedactRestoreUtils.restore_data(source_data.values.first, redacted_data.values.first, plugins, format)
      I18nScriptUtils.write_yaml_file(dest, restored)
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

  # redact redacts the content of the source file, whether is a json, yml or other formats and write the output
  # into the dest file.
  def self.redact(source, dest, plugins = [], format = 'md')
    return unless File.exist? source

    if I18nScriptUtils.json_file?(source) || I18nScriptUtils.yaml_file?(source)
      source_data = I18nScriptUtils.parse_file(source)
      redacted = RedactRestoreUtils.redact_data(source_data, plugins, format)

      I18nScriptUtils.write_yaml_file(dest, redacted) if I18nScriptUtils.yaml_file?(source)
      I18nScriptUtils.write_json_file(dest, redacted) if I18nScriptUtils.json_file?(source)
    else
      redacted = redact_file(source_data, plugins, format)
      I18nScriptUtils.write_file(dest, redacted)
    end
  end

  private_class_method def self.plugins_to_arg(plugins)
    plugins.map {|name| CDO.dir("bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{name}.js") if name}.join(',')
  end
end
