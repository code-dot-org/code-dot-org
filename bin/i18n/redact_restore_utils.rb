require 'json'
require 'open3'
require 'tempfile'
require 'yaml'

require_relative 'i18n_script_utils'

class RedactRestoreUtils
  def self.redact_file(source_path, plugins=[], format='md')
    args = ['bin/i18n/node_modules/.bin/redact']
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push("-s #{source_path.inspect}")
    stdout, _status = Open3.capture2(args.join(" "))

    return JSON.parse(stdout)
  end

  def self.restore_file(source_path, redacted_path, plugins=[], format='md')
    args = ['bin/i18n/node_modules/.bin/restore']
    args.push("-p #{plugins_to_arg(plugins)}") unless plugins.empty?
    args.push("-f #{format}")
    args.push("-s #{source_path.inspect}")
    args.push("-r #{redacted_path.inspect}")

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
    source_data =
      if File.extname(source) == '.json'
        JSON.load(File.open(source, 'r'))
      else
        YAML.load_file(source)
      end
    redacted_data =
      if File.extname(redacted) == '.json'
        JSON.load(File.open(redacted, 'r'))
      else
        YAML.load_file(redacted)
      end

    return unless source_data
    return unless redacted_data

    restored = RedactRestoreUtils.restore_data(
      File.extname(source) == '.json' ? source_data : source_data&.values&.first&.values&.first&.values&.first || {},
      File.extname(redacted) == '.json' ? redacted_data : redacted_data&.values&.first&.values&.first&.values&.first || {},
      plugins,
      format
    )

    File.open(dest, "w+") do |file|
      if File.extname(dest) == '.json'
        file.write(JSON.pretty_generate(restored))
      elsif redacted_data &&
        redacted_data.keys.length &&
        redacted_data.values.first &&
        redacted_data.values.first.keys.length &&
        redacted_data.values.first.values.first &&
        redacted_data.values.first.values.first.keys.length

        file.write(
          I18nScriptUtils.to_crowdin_yaml(
            {
              redacted_data.keys.first => {
                redacted_data.values.first.keys.first => {
                  redacted_data.values.first.values.first.keys.first => restored.sort.to_h
                }
              }
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
        JSON.load(File.open(source, 'r'))
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
