require 'json'
require 'open3'
require 'shellwords'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'

class RedactRestoreUtils
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

  # Restores redacted data into a json/yaml/yml file
  #
  # @param source [String] the source file path
  # @param redacted [String] the redacted file path
  # @param dest [String] the target (restored) file path
  # @param plugins [Array] the list of plugins to use
  # @param format [String] the format of the data (md, txt, etc.)
  def self.restore(source, redacted, dest, plugins = [], format = 'md')
    raise "[#{source}] source file does not exist" unless File.exist?(source)
    raise "[#{redacted}] redacted file does not exist" unless File.exist?(redacted)

    source_data = I18nScriptUtils.parse_file(source) || {}
    raise "[#{source}] source data does not exist" if source_data.empty?

    redacted_data = I18nScriptUtils.parse_file(redacted) || {}
    return if redacted_data.empty?

    restore_data = -> {RedactRestoreUtils.restore_data(source_data, redacted_data, plugins, format)}

    if I18nScriptUtils.json_file?(dest)
      I18nScriptUtils.write_json_file(dest, restore_data.call)
    elsif I18nScriptUtils.yaml_file?(dest)
      # Some yaml files have a locale key wrapping all content.
      # Redacted files have the translated language key, while the un-redacted file keeps the English key.
      # We need to extract the data inside the locale key to restore content.
      source_data[redacted_data.keys.first] = source_data.delete(source_data.keys.first) if source_data.keys.size == 1

      return I18nScriptUtils.write_yaml_file(dest, restore_data.call)
    else
      raise "[#{dest}] unknown target file format"
    end
  end

  # redact redacts the content of the source file, whether is a json, yml or other formats and write the output
  # into the dest file.
  # TODO: split into two methods `redact_json_file` and `redact_yaml_file`
  def self.redact(source, dest, plugins = [], format = 'md')
    return unless File.exist? source
    return unless I18nScriptUtils.json_file?(source) || I18nScriptUtils.yaml_file?(source)

    source_data = I18nScriptUtils.parse_file(source)
    redacted = RedactRestoreUtils.redact_data(source_data, plugins, format)

    I18nScriptUtils.write_yaml_file(dest, redacted) if I18nScriptUtils.yaml_file?(source)
    I18nScriptUtils.write_json_file(dest, redacted) if I18nScriptUtils.json_file?(source)
  end

  def self.redact_markdown(source, dest, plugins = [], format = 'md')
    return unless File.exist? source
    return unless File.extname(source) == '.md'

    redacted = redact_file(source, plugins, format)
    I18nScriptUtils.write_file(dest, redacted)
  end

  def self.restore_markdown(source, redacted, dest, plugins = [], format = 'md')
    return unless File.exist?(source)
    return unless File.exist?(redacted)
    return unless File.extname(source) == '.md'

    restored = RedactRestoreUtils.restore_file(source, redacted, plugins, format)
    I18nScriptUtils.write_file(dest, restored)
  end

  private_class_method def self.plugins_to_arg(plugins)
    plugins.map {|name| CDO.dir("bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{name}.js") if name}.join(',')
  end
end
