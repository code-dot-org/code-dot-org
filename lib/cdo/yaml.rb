require 'yaml'
require 'cdo/erb'

module Cdo
  # Extend YAML with customizations.
  module YAMLExtension
    def parse_yaml_header(content, locals = {})
      match = content.match(/\A\s*^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
      return [{}, content] unless match

      yaml = match[:yaml]
      yaml = ERB.new(yaml).result_with_hash(locals)
      [YAML.safe_load(yaml), match.post_match]
    end

    # Return +nil+ if file not found.
    def load_file(path)
      super
    rescue Errno::ENOENT
      nil
    end

    # Load a `.yml.erb` file
    #
    # Because ERB is already inherently unsafe (and because we never use this
    # for anything user-facing), we can reasonably forego using
    # `YAML.safe_load`. And because we do some complicated and potentially
    # dangerous things in the various `config.yml.erb` files loaded by this
    # method, we need to do so.
    def load_erb_file(path, binding = nil)
      # rubocop:disable Security/YAMLLoad
      YAML.load(erb_file_to_string(path, binding), path)
      # rubocop:enable Security/YAMLLoad
    rescue Errno::ENOENT
      nil
    end
  end

  ::YAML.singleton_class.prepend YAMLExtension
end
